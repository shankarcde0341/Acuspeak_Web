'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlanItem, fetchPlansCatalog, createCheckoutSession } from '@/services/paymentService';
import styles from './Pricing.module.css';

interface PricingViewProps {
  initialPlans: PlanItem[];
}

export default function PricingView({ initialPlans }: PricingViewProps) {
  const router = useRouter();
  const [plans, setPlans] = useState<PlanItem[]>(initialPlans);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('monthly');
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlansCatalog().then((catalog) => {
      if (catalog && catalog.length > 0) {
        setPlans(catalog);
      }
    });
  }, []);

  const handleCheckout = async (planId: string) => {
    setError(null);
    setLoadingPlanId(planId);
    try {
      const res = await createCheckoutSession(planId);
      if (res.error) {
        setError(res.error);
        setLoadingPlanId(null);
      } else if (res.checkout_url) {
        // Safe redirect to checkout URL or payment success page
        window.location.href = res.checkout_url;
      }
    } catch {
      setError('An unexpected error occurred during checkout initialization.');
      setLoadingPlanId(null);
    }
  };

  const defaultPlansFallback: PlanItem[] = [
    {
      id: 'weekly',
      name: 'Weekly Pass',
      price_inr: 149,
      billing_period: '7 Days',
      days: 7,
      is_popular: false,
      badge: 'FLEXIBLE',
      description: '7 days of complete fluency training and live partner practice.',
      features: [
        'Unlimited Live 1-on-1 Practice Calls',
        'AI Pronunciation Feedback',
        'Basic Certificates',
        'Ad-Free Experience',
      ],
    },
    {
      id: 'monthly',
      name: 'Monthly Pro',
      price_inr: 399,
      billing_period: 'Monthly',
      days: 30,
      is_popular: true,
      badge: 'MOST POPULAR',
      description: 'Our most popular plan for steady, high-impact English fluency.',
      features: [
        'Unlimited Live 1-on-1 Practice Calls',
        'Real-Time AI Pronunciation & Grammar Feedback',
        'Gender & Level Matching Filter',
        'Official Verified Speaking Certificates',
        'Priority Queue Matchmaking',
        'Ad-Free Premium Experience',
      ],
    },
    {
      id: 'quarterly',
      name: 'Quarterly Pass',
      price_inr: 899,
      billing_period: '3 Months',
      days: 90,
      is_popular: false,
      badge: 'BEST VALUE (SAVE 40%)',
      description: '90 days of complete English mastery at our best value rate.',
      features: [
        'All Monthly Pro Features Included',
        'Save 40% Compared to Weekly Rate',
        'Dedicated Business English & Interview Modules',
        'Direct 1-on-1 AI Mock Interviews',
        'Priority VIP Support & Badge',
      ],
    },
  ];

  const activePlans = plans.length > 0 ? plans : defaultPlansFallback;

  return (
    <div className={styles.container}>
      {/* 1. Hero Header */}
      <section className={styles.heroHeader}>
        <div className={styles.heroEyebrow}>
          <span>💎 Acuspeak Membership</span>
          <span>•</span>
          <span>Risk-Free & Cancel Anytime</span>
        </div>
        <h1 className={styles.heroTitle}>Unlock Your Full English Fluency Potential</h1>
        <p className={styles.heroSubtitle}>
          Connect with live global speakers, get real-time AI pronunciation feedback, and earn verified certificates.
        </p>
      </section>

      {/* 2. Promo Banner */}
      <div className={styles.promoBanner}>
        <div className={styles.promoText}>
          <span className={styles.promoBadge}>SPECIAL OFFER</span>
          <span>🎁 Active Referral Bonus: Get 20% Extra Extended Duration on all membership plans!</span>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold p-4 rounded-xl text-center">
          {error}
        </div>
      )}

      {/* 3. Pricing Grid */}
      <section className={styles.plansGrid} aria-label="Membership Tiers">
        {activePlans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          const isBusy = loadingPlanId === plan.id;

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`${styles.planCard} ${plan.is_popular ? styles.planCardPopular : ''
                } ${isSelected ? styles.planCardSelected : ''}`}
            >
              {plan.badge && <div className={styles.popularRibbon}>{plan.badge}</div>}

              <div>
                <div className={styles.planHeader}>
                  <h2 className={styles.planName}>{plan.name}</h2>
                  <div className={styles.planPriceRow}>
                    <span className={styles.currencySymbol}>₹</span>
                    <span className={styles.priceNumber}>{plan.price_inr}</span>
                    <span className={styles.pricePeriod}>/ {plan.billing_period}</span>
                  </div>
                  <p className={styles.planDesc}>{plan.description}</p>
                </div>

                <ul className={styles.featuresList}>
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className={styles.featureItem}>
                      <svg className={styles.checkIcon} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCheckout(plan.id);
                }}
                disabled={isBusy}
                className={`${styles.selectPlanBtn} ${plan.is_popular ? styles.btnPrimary : styles.btnSecondary
                  }`}
              >
                {isBusy ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Initializing Checkout...</span>
                  </>
                ) : (
                  <>
                    <span>Continue with {plan.name}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </section>

      {/* 4. Feature Comparison Matrix */}
      <section className={styles.matrixSection} aria-label="Feature Comparison Matrix">
        <h2 className={styles.matrixTitle}>Compare Plan Features</h2>
        <div className={styles.tableContainer}>
          <table className={styles.matrixTable}>
            <thead>
              <tr>
                <th>Feature</th>
                <th className={styles.cellCenter}>Free Plan</th>
                <th className={styles.cellCenter}>Pro Membership</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ad-Free Practice Experience</td>
                <td className={`${styles.cellCenter} ${styles.iconNo}`}>✕</td>
                <td className={`${styles.cellCenter} ${styles.iconYes}`}>✔ Included</td>
              </tr>
              <tr>
                <td>Unlimited Live 1-on-1 Speaking Calls</td>
                <td className={`${styles.cellCenter} ${styles.iconNo}`}>Limited (5 mins/day)</td>
                <td className={`${styles.cellCenter} ${styles.iconYes}`}>✔ Unlimited</td>
              </tr>
              <tr>
                <td>Real-time AI Pronunciation & Grammar Feedback</td>
                <td className={`${styles.cellCenter} ${styles.iconNo}`}>✕</td>
                <td className={`${styles.cellCenter} ${styles.iconYes}`}>✔ Included</td>
              </tr>
              <tr>
                <td>Gender & Level Filter Matching</td>
                <td className={`${styles.cellCenter} ${styles.iconNo}`}>✕</td>
                <td className={`${styles.cellCenter} ${styles.iconYes}`}>✔ Included</td>
              </tr>
              <tr>
                <td>Verified English Speaking Certificates</td>
                <td className={`${styles.cellCenter} ${styles.iconNo}`}>✕</td>
                <td className={`${styles.cellCenter} ${styles.iconYes}`}>✔ Included</td>
              </tr>
              <tr>
                <td>Priority Matchmaking Queue</td>
                <td className={`${styles.cellCenter} ${styles.iconNo}`}>Standard</td>
                <td className={`${styles.cellCenter} ${styles.iconYes}`}>✔ Instant VIP Queue</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
