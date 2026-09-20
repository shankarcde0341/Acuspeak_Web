'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Mode = 'picker' | 'phone-enter' | 'phone-otp';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('picker');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [referral, setReferral] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugCode, setDebugCode] = useState<string | null>(null);

  const handleGoogleLogin = () => {
    setBusy(true);
    // Yahan backend OAuth URL ke sath connect hoga
    window.location.href = 'http://localhost:8000/api/auth/session';
  };

  const sendOtp = async () => {
    setError(null);
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 6) {
      setError('Please enter a valid phone number.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('http://localhost:8000/api/auth/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `${countryCode}${clean}` }),
      });
      const data = await res.json();
      if (data.debug_code) setDebugCode(data.debug_code);
      setMode('phone-otp');
    } catch {
      // Fallback for mock if backend is not live yet
      setDebugCode('123456');
      setMode('phone-otp');
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    setError(null);
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the 6-digit code');
      return;
    }
    setBusy(true);
    try {
      const clean = phone.replace(/\D/g, '');
      const res = await fetch('http://localhost:8000/api/auth/phone/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: `${countryCode}${clean}`,
          otp,
          name: name || undefined,
          referral: referral || undefined,
        }),
      });
      if (!res.ok) throw new Error('Verification failed');
      const data = await res.json();
      localStorage.setItem('session_token', data.session_token);
      router.push('/dashboard');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#312E81] overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute -top-16 -left-16 w-60 h-60 rounded-full bg-blue-300/15 pointer-events-none blur-2xl" />
      <div className="absolute -bottom-20 -right-16 w-64 h-64 rounded-full bg-sky-400/18 pointer-events-none blur-2xl" />

      <div className="w-full max-w-md z-10 my-auto">
        {/* Brand Header */}
        <Link
          href="/"
          className="flex flex-col items-center justify-center text-center mb-6 sm:mb-8 group hover:opacity-95 transition-opacity"
        >
          <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-blue-300 via-blue-500 to-blue-900 inline-flex items-center justify-center text-white shadow-xl mb-3 group-hover:scale-105 transition-transform shrink-0">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"
              />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-outfit tracking-tight">
            Acuspeak
          </h1>
          <p className="text-white/80 text-sm mt-1 font-medium">
            Your personal English speaking coach
          </p>
        </Link>

        {/* Card Container */}
        <div className="bg-white rounded-[28px] p-6 sm:p-8 shadow-2xl border border-white/50 w-full">
          {/* Mode 1: Picker (Google or Phone) */}
          {mode === 'picker' && (
            <div>
              <h2 className="text-2xl font-bold font-outfit text-[var(--text-primary)] mb-1 leading-snug">
                Welcome
              </h2>
              <p className="text-[var(--text-secondary)] text-sm mb-6 font-medium leading-normal">
                Sign in to start your speaking journey.
              </p>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={busy}
                className="w-full flex items-center justify-center gap-3 h-[52px] rounded-full bg-white border border-[var(--divider)] hover:bg-gray-50 transition-all font-semibold text-[15px] text-[var(--text-primary)] shadow-sm mb-4 cursor-pointer leading-none"
              >
                <div className="w-6 h-6 rounded-full bg-[#EA4335] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  G
                </div>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-[1px] bg-[var(--divider)]" />
                <span className="text-xs font-semibold text-[var(--text-muted)] tracking-wider">
                  OR
                </span>
                <div className="flex-1 h-[1px] bg-[var(--divider)]" />
              </div>

              <button
                type="button"
                onClick={() => setMode('phone-enter')}
                className="w-full flex items-center justify-center gap-2.5 h-[52px] rounded-full bg-[var(--primary)] text-white font-semibold text-[15px] shadow-lg shadow-blue-900/20 hover:opacity-95 transition-opacity cursor-pointer leading-none"
              >
                <svg
                  className="w-5 h-5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>Continue with Phone</span>
              </button>

              {error && (
                <p className="text-rose-600 text-xs mt-3 text-center font-medium">
                  {error}
                </p>
              )}

              <p className="text-xs text-[var(--text-secondary)] text-center mt-6 leading-relaxed font-medium">
                By continuing you agree to our{' '}
                <a
                  href="#"
                  className="text-[var(--primary)] underline font-semibold hover:opacity-90"
                >
                  Terms
                </a>{' '}
                and{' '}
                <a
                  href="#"
                  className="text-[var(--primary)] underline font-semibold hover:opacity-90"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          )}

          {/* Mode 2: Phone Number Input */}
          {mode === 'phone-enter' && (
            <div>
              <button
                type="button"
                onClick={() => setMode('picker')}
                className="inline-flex items-center gap-1 text-[var(--primary)] font-bold text-xs mb-4 hover:underline cursor-pointer"
              >
                ← Back
              </button>
              <h2 className="text-2xl font-bold font-outfit text-[var(--text-primary)] mb-1 leading-snug">
                Enter your phone
              </h2>
              <p className="text-[var(--text-secondary)] text-sm mb-5 font-medium leading-normal">
                We&apos;ll text you a 6-digit code.
              </p>

              <div className="flex gap-2.5 mb-4">
                <input
                  type="text"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  maxLength={5}
                  className="w-20 h-12 rounded-xl bg-slate-100 px-3 font-bold text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className="flex-1 h-12 rounded-xl bg-slate-100 px-4 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <button
                type="button"
                onClick={sendOtp}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 h-[52px] rounded-full bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#38BDF8] text-white font-semibold text-[15px] shadow-lg shadow-blue-900/20 hover:opacity-95 transition-opacity mt-2 cursor-pointer leading-none"
              >
                {busy ? 'Sending...' : 'Send code'}
              </button>

              {error && (
                <p className="text-rose-600 text-xs mt-3 text-center font-medium">
                  {error}
                </p>
              )}
              <p className="text-xs text-[var(--text-muted)] text-center mt-4 italic">
                MOCK OTP mode — any code works.
              </p>
            </div>
          )}

          {/* Mode 3: OTP Verification */}
          {mode === 'phone-otp' && (
            <div>
              <button
                type="button"
                onClick={() => setMode('phone-enter')}
                className="inline-flex items-center gap-1 text-[var(--primary)] font-bold text-xs mb-4 hover:underline cursor-pointer"
              >
                ← Change number
              </button>
              <h2 className="text-2xl font-bold font-outfit text-[var(--text-primary)] mb-1 leading-snug">
                Verify code
              </h2>
              <p className="text-[var(--text-secondary)] text-sm mb-4 font-medium leading-normal">
                Sent to {countryCode}
                {phone}
              </p>

              {debugCode && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-3.5 py-2 rounded-xl mb-4 flex items-center gap-2">
                  <span>💡 Debug code: {debugCode}</span>
                </div>
              )}

              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="------"
                className="w-full h-14 rounded-xl bg-slate-100 font-bold text-2xl tracking-[10px] text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (new users)"
                className="w-full h-12 rounded-xl bg-slate-100 px-4 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />

              <input
                type="text"
                value={referral}
                onChange={(e) => setReferral(e.target.value.toUpperCase())}
                placeholder="Referral code (optional)"
                className="w-full h-12 rounded-xl bg-slate-100 px-4 text-sm font-medium text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />

              <button
                type="button"
                onClick={verifyOtp}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 h-[52px] rounded-full bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#38BDF8] text-white font-semibold text-[15px] shadow-lg shadow-blue-900/20 hover:opacity-95 transition-opacity cursor-pointer leading-none"
              >
                {busy ? 'Verifying...' : 'Verify & continue'}
              </button>

              <button
                type="button"
                onClick={sendOtp}
                className="w-full text-center mt-4 text-xs text-[var(--primary)] font-bold hover:underline cursor-pointer"
              >
                Resend code
              </button>

              {error && (
                <p className="text-rose-600 text-xs mt-3 text-center font-medium">
                  {error}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}