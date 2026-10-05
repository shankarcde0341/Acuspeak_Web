'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ReferralData, fetchReferralData } from '@/services/referralService';
import styles from '@/app/(dashboard)/referral/Referral.module.css';

interface ReferralViewProps {
  initialData: ReferralData | null;
}

export default function ReferralView({ initialData }: ReferralViewProps) {
  const [data, setData] = useState<ReferralData | null>(initialData);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchReferralData().then((res) => {
      if (res) setData(res);
    });
  }, []);

  const referralCode = data?.referral_code || 'ACU-SPEAK88';
  const referralLink = data?.referral_link || 'https://acuspeak.com/login?ref=ACU-SPEAK88';
  const shareMessage =
    data?.share_message ||
    `Join me on Acuspeak to practice English speaking 1-on-1 with live global partners! Use my invite code ${referralCode} or link ${referralLink} to get 20% OFF your membership + Rs. 50 cashback!`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      showToast('Referral code copied to clipboard!');
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      showToast(`Code: ${referralCode}`);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      showToast('Invite link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      showToast(`Link: ${referralLink}`);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSocialShare = (platform: string) => {
    const encodedMsg = encodeURIComponent(shareMessage);
    const encodedLink = encodeURIComponent(referralLink);

    switch (platform) {
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodedMsg}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodedMsg}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodedLink}&text=${encodedMsg}`, '_blank');
        break;
      case 'instagram':
      default:
        handleCopyLink();
        showToast('Invite message copied! Paste it in your Instagram story or DM.');
        break;
    }
  };

  const socialChannels = [
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: '#25D366' },
    { id: 'instagram', name: 'Instagram', icon: '📸', color: '#E1306C' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0A66C2' },
    { id: 'twitter', name: 'X / Twitter', icon: '🐦', color: '#000000' },
    { id: 'telegram', name: 'Telegram', icon: '✈️', color: '#0088CC' },
  ];

  return (
    <div className={styles.container}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white font-semibold text-sm px-5 py-3 rounded-full shadow-2xl z-50 animate-bounce flex items-center gap-2">
          <span>💡</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header & Hero Section */}
      <section className={styles.heroHero} aria-label="Referral Program Banner">
        <div className={styles.heroOrb1} />
        <div className={styles.heroOrb2} />

        <div className={styles.topBar}>
          <Link href="/profile" className={styles.backLink}>
            <span>← Back to Profile</span>
          </Link>
          <span className={styles.topBadge}>EARN CASHBACK & DISCOUNTS</span>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.giftIconTile}>🎁</div>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>Get Upto Rs. 50 Cashback</h1>
            <p className={styles.heroSubtext}>
              Invite friends to Acuspeak. When they join using your invite code, they get <strong>20% OFF</strong> their membership plan and you get <strong>Rs. 50 Cashback</strong>!
            </p>
          </div>
        </div>
      </section>

      {/* 2. Referral Code Card */}
      <section className={styles.codeCard} aria-label="Your Unique Referral Code">
        <div className={styles.cardHeader}>
          <span className={styles.cardLabel}>Your Unique Invite Code</span>
          <span className="text-xs font-semibold text-slate-500">Tap to copy</span>
        </div>

        <div className={styles.codeBox}>
          <span className={styles.codeText}>{referralCode}</span>
          <button
            type="button"
            onClick={handleCopyCode}
            className={`${styles.copyBtn} ${copiedCode ? styles.copyBtnCopied : ''}`}
          >
            {copiedCode ? (
              <>
                <span>✔ Copied</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* 3. Stats Grid Section */}
      <section className={styles.statsGrid} aria-label="Referral Statistics">
        {/* Friends Invited */}
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statTitle}>Friends Invited</span>
            <span className={styles.statValue}>{data?.referral_count ?? 0}</span>
            <span className={styles.statSubtitle}>Successful registrations</span>
          </div>
          <div className={styles.statIconTile}>👥</div>
        </div>

        {/* Cashback / Discount Status */}
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statTitle}>Cashback Earned</span>
            <span className={styles.statValue}>₹{data?.cashback_earned_inr ?? 0}</span>
            <span className={styles.statSubtitle}>
              {data?.referral_discount_active ? '20% Discount Unlocked' : 'Invite friends to earn'}
            </span>
          </div>
          <div className={styles.statIconTile}>💰</div>
        </div>
      </section>

      {/* 4. Share Via Grid (Social Channels) */}
      <section className={styles.section} aria-label="Share via Social Media">
        <h2 className={styles.sectionTitle}>Share Via Social Channels</h2>
        <div className={styles.shareGrid}>
          {socialChannels.map((channel) => (
            <button
              key={channel.id}
              type="button"
              onClick={() => handleSocialShare(channel.id)}
              className={styles.shareTile}
            >
              <div className={styles.shareTileIcon} style={{ background: channel.color }}>
                {channel.icon}
              </div>
              <span className={styles.shareTileName}>{channel.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 5. Primary Action CTA Button */}
      <button type="button" onClick={handleCopyLink} className={styles.ctaBtn}>
        {copiedLink ? (
          <>
            <span>✔ Invite Link Copied to Clipboard</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>Copy Complete Invite Link</span>
          </>
        )}
      </button>
    </div>
  );
}
