'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser, initiateGoogleLogin, sendPhoneOtp, verifyPhoneOtp, setAuthSession, isLoggedIn } from '@/services/authService';

type Mode = 'picker' | 'phone-enter' | 'phone-otp';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('picker');

  // Email & Password State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone & OTP State
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [referral, setReferral] = useState('');

  // Status & Debug States
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugCode, setDebugCode] = useState<string | null>(null);

  // Check URL search parameters and existing auth state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlError = params.get('error');
      if (urlError) {
        setError(decodeURIComponent(urlError));
      }

      // If user is already logged in, redirect directly to dashboard or target URL
      if (isLoggedIn()) {
        const target = params.get('redirect') || '/dashboard';
        router.replace(target);
      }
    }
  }, [router]);

  // Email / Password Login Handler
  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setBusy(true);

    try {
      const response = await loginUser({ email: email.trim(), password });

      if ('error' in response) {
        setError(response.error);
      } else {
        setAuthSession({
          email: response.email,
          name: response.name,
        });

        const params = new URLSearchParams(window.location.search);
        const target = params.get('redirect') || '/dashboard';
        router.push(target);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // Google OAuth Login Handler
  const handleGoogleLogin = () => {
    setBusy(true);
    initiateGoogleLogin();
  };

  // Phone OTP Send Handler
  const sendOtp = async () => {
    setError(null);
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 6) {
      setError('Please enter a valid phone number.');
      return;
    }
    setBusy(true);
    try {
      const fullPhone = `${countryCode}${clean}`;
      const data = await sendPhoneOtp(fullPhone);

      if (data.error) {
        setError(data.error);
      } else {
        if (data.debug_code) setDebugCode(data.debug_code);
        setMode('phone-otp');
      }
    } catch {
      setError('Unable to send OTP. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // Phone OTP Verification Handler
  const verifyOtp = async () => {
    setError(null);
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the 6-digit code');
      return;
    }
    setBusy(true);
    try {
      const clean = phone.replace(/\D/g, '');
      const fullPhone = `${countryCode}${clean}`;

      const data = await verifyPhoneOtp({
        phone: fullPhone,
        otp,
        name: name || undefined,
        referral: referral || undefined,
      });

      if (data.error) {
        setError(data.error);
      } else {
        setAuthSession(
          {
            email: data.email || `${clean}@phone.user`,
            name: data.name || name || 'Phone User',
          },
          data.session_token
        );

        const params = new URLSearchParams(window.location.search);
        const target = params.get('redirect') || '/dashboard';
        router.push(target);
      }
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
          {/* Mode 1: Picker (Email Form + Google + Phone) */}
          {mode === 'picker' && (
            <div>
              <h2 className="text-2xl font-bold font-outfit text-slate-900 mb-1 leading-snug">
                Welcome
              </h2>
              <p className="text-slate-600 text-sm mb-5 font-medium leading-normal">
                Sign in to start your speaking journey.
              </p>

              {/* Email & Password Form */}
              <form onSubmit={handleEmailLogin} className="space-y-3.5 mb-5">
                <div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full h-12 rounded-xl bg-slate-100 px-4 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full h-12 rounded-xl bg-slate-100 pl-4 pr-11 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.038 10.038 0 013.682-.863c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-6.853-6.853a3 3 0 004.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full flex items-center justify-center gap-2 h-[52px] rounded-full bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#38BDF8] text-white font-semibold text-[15px] shadow-lg shadow-blue-900/20 hover:opacity-95 transition-opacity cursor-pointer leading-none"
                >
                  {busy ? 'Signing in...' : 'Sign in with Email'}
                </button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-[1px] bg-slate-200" />
                <span className="text-xs font-semibold text-slate-400 tracking-wider">
                  OR
                </span>
                <div className="flex-1 h-[1px] bg-slate-200" />
              </div>

              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={busy}
                className="w-full flex items-center justify-center gap-3 h-[52px] rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition-all font-semibold text-[15px] text-slate-800 shadow-sm mb-3 cursor-pointer leading-none"
              >
                <div className="w-6 h-6 rounded-full bg-[#EA4335] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  G
                </div>
                <span>Continue with Google</span>
              </button>

              {/* Phone Login Button */}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('phone-enter');
                }}
                className="w-full flex items-center justify-center gap-2.5 h-[52px] rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[15px] shadow-md transition-all cursor-pointer leading-none"
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

              <p className="text-xs text-slate-500 text-center mt-6 leading-relaxed font-medium">
                By continuing you agree to our{' '}
                <a
                  href="#"
                  className="text-blue-600 underline font-semibold hover:opacity-90"
                >
                  Terms
                </a>{' '}
                and{' '}
                <a
                  href="#"
                  className="text-blue-600 underline font-semibold hover:opacity-90"
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
                onClick={() => {
                  setError(null);
                  setMode('picker');
                }}
                className="inline-flex items-center gap-1 text-blue-600 font-bold text-xs mb-4 hover:underline cursor-pointer"
              >
                ← Back
              </button>
              <h2 className="text-2xl font-bold font-outfit text-slate-900 mb-1 leading-snug">
                Enter your phone
              </h2>
              <p className="text-slate-600 text-sm mb-5 font-medium leading-normal">
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
              <p className="text-xs text-slate-400 text-center mt-4 italic">
                MOCK OTP mode — any code works.
              </p>
            </div>
          )}

          {/* Mode 3: OTP Verification */}
          {mode === 'phone-otp' && (
            <div>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('phone-enter');
                }}
                className="inline-flex items-center gap-1 text-blue-600 font-bold text-xs mb-4 hover:underline cursor-pointer"
              >
                ← Change number
              </button>
              <h2 className="text-2xl font-bold font-outfit text-slate-900 mb-1 leading-snug">
                Verify code
              </h2>
              <p className="text-slate-600 text-sm mb-4 font-medium leading-normal">
                Sent to {countryCode} {phone}
              </p>

              {debugCode && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold px-3.5 py-2.5 rounded-xl mb-4 flex items-center justify-between shadow-sm">
                  <span>💡 Demo OTP Code: <strong className="font-mono text-sm">{debugCode}</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtp(debugCode)}
                    className="bg-amber-200 hover:bg-amber-300 text-amber-950 text-[11px] px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-colors"
                  >
                    Auto-fill
                  </button>
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
                className="w-full text-center mt-4 text-xs text-blue-600 font-bold hover:underline cursor-pointer"
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