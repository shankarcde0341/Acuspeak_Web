"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./Match.module.css";
import {
  joinMatch,
  getMatchStatus,
  cancelMatch,
  getZegoToken,
  PartnerInfo,
} from "@/services/matchService";

/* ──────────────────────────────────────────
   Types
   ────────────────────────────────────────── */

type MatchState = "idle" | "searching" | "found";

const WAVEFORM_HEIGHTS = [10, 18, 26, 14, 30, 20, 12, 24, 16, 22, 10, 18, 28, 14, 20];

export default function MatchScreen() {
  const router = useRouter();
  const [state, setState] = useState<MatchState>("idle");
  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTimeoutOpen, setIsTimeoutOpen] = useState<boolean>(false);
  const [isConnectingCall, setIsConnectingCall] = useState<boolean>(false);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Helper to clear all active timers */
  const clearTimers = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
  }, []);

  /* Cleanup timers on component unmount */
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  /* Start matchmaking flow */
  const startSearching = useCallback(async () => {
    clearTimers();
    setErrorMsg(null);
    setIsTimeoutOpen(false);

    const res = await joinMatch();

    if (res.error) {
      setErrorMsg(res.error);
      setState("idle");
      return;
    }

    if (res.status === "matched" && res.room_id && res.partner) {
      setRoomId(res.room_id);
      setPartner(res.partner);
      setState("found");
      return;
    }

    if (res.status === "searching") {
      setState("searching");

      /* 120-second timeout timer */
      timeoutTimerRef.current = setTimeout(async () => {
        clearTimers();
        await cancelMatch();
        setIsTimeoutOpen(true);
        setState("idle");
      }, 120000);

      /* 2-second status polling interval */
      pollIntervalRef.current = setInterval(async () => {
        const statusRes = await getMatchStatus();

        if (statusRes.error) {
          clearTimers();
          setErrorMsg(statusRes.error);
          setState("idle");
          return;
        }

        if (statusRes.status === "matched" && statusRes.room_id && statusRes.partner) {
          clearTimers();
          setRoomId(statusRes.room_id);
          setPartner(statusRes.partner);
          setState("found");
        }
      }, 2000);
    }
  }, [clearTimers]);

  /* Cancel active searching */
  const handleCancelSearch = useCallback(async () => {
    clearTimers();
    await cancelMatch();
    setState("idle");
    setPartner(null);
    setRoomId(null);
  }, [clearTimers]);

  /* Skip to next partner */
  const handleNextPartner = useCallback(async () => {
    clearTimers();
    await cancelMatch();
    setPartner(null);
    setRoomId(null);
    await startSearching();
  }, [clearTimers, startSearching]);

  /* Start voice call — fetch Zego token and navigate */
  const handleStartVoiceCall = useCallback(async () => {
    if (!roomId || !partner) return;
    setIsConnectingCall(true);
    setErrorMsg(null);

    const zegoRes = await getZegoToken(roomId);

    if (zegoRes.error || !zegoRes.token) {
      setErrorMsg(zegoRes.error || "Failed to generate call token. Please try again.");
      setIsConnectingCall(false);
      return;
    }

    const params = new URLSearchParams({
      name: partner.name,
      room_id: roomId,
      target_user_id: partner.id,
      token: zegoRes.token,
    });

    router.push(`/practice/call?${params.toString()}`);
  }, [partner, roomId, router]);

  /* Timeout try again click handler */
  const handleTimeoutTryAgain = useCallback(() => {
    setIsTimeoutOpen(false);
    startSearching();
  }, [startSearching]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        {/* ─── Error Notification Banner ─── */}
        {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

        {/* ─── Idle State ─── */}
        {state === "idle" && (
          <>
            <div className={styles.idleRing}>
              <svg
                className={styles.idleRingIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="23" y1="11" x2="17" y2="11" />
                <line x1="20" y1="8" x2="20" y2="14" />
              </svg>
            </div>
            <h1 className={styles.heading}>Find a match</h1>
            <p className={styles.description}>
              We&apos;ll pair you with an available partner for live voice practice.
            </p>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={startSearching}
            >
              Start searching
            </button>
          </>
        )}

        {/* ─── Searching State ─── */}
        {state === "searching" && (
          <>
            <div className={styles.pulseContainer} aria-hidden="true">
              <div className={styles.pulseRing} />
              <div className={`${styles.pulseRing} ${styles.pulseRingDelayed}`} />
              <div className={styles.pulseCore}>
                <svg
                  className={styles.pulseCoreIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </div>
            <span className={styles.searchingLabel}>Finding a partner&hellip;</span>
            <p className={styles.searchingSub}>
              Matching with online users in real-time
            </p>
            <div className={styles.waveform} aria-hidden="true">
              {WAVEFORM_HEIGHTS.map((h, i) => (
                <span
                  key={i}
                  className={styles.waveBar}
                  style={{ height: h, animationDelay: `${i * 0.08}s` }}
                />
              ))}
            </div>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={handleCancelSearch}
            >
              Cancel
            </button>
          </>
        )}

        {/* ─── Found State ─── */}
        {state === "found" && partner && (
          <>
            <div className={styles.partnerSection}>
              <div className={`${styles.avatarLarge} ${styles.avatarBlue}`}>
                {partner.name.charAt(0).toUpperCase()}
              </div>
              <span className={styles.partnerName}>{partner.name}</span>
              <div className={styles.partnerMeta}>
                <span className={styles.onlineBadge}>
                  <span className={styles.onlineDot} />
                  Matched &amp; Ready
                </span>
              </div>
            </div>

            <div className={styles.btnRow}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleStartVoiceCall}
                disabled={isConnectingCall}
              >
                {isConnectingCall ? "Connecting..." : "Start voice call"}
              </button>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={handleNextPartner}
                disabled={isConnectingCall}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* ─── 120s Timeout Modal Popup ─── */}
      {isTimeoutOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <h2 className={styles.modalTitle}>No users free right now</h2>
            <p className={styles.modalSub}>
              All practice partners are currently busy or in a call. Please try searching again in a moment.
            </p>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleTimeoutTryAgain}
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <Link href="/practice" className={styles.backLink}>
        &larr; Back to Practice
      </Link>
    </div>
  );
}
