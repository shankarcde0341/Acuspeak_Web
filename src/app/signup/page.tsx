'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signupUser, setAuthSession, isLoggedIn } from '@/services/authService';

export default function SignupPage() {
  const router = useRouter();

  // Form state
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [email, setEmail] = useState('');
  const [number, setNumber] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    number?: string;
  }>({});

  useEffect(() => {
    if (isLoggedIn()) {
      router.replace('/dashboard');
    }
  }, [router]);

  const validate = (): boolean => {
    const errors: { name?: string; email?: string; password?: string; number?: string } = {};
    let isValid = true;

    // 1. Name Mandatory
    if (!name.trim()) {
      errors.name = 'Full name is required.';
      isValid = false;
    }

    // 2. Email Address Mandatory
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        errors.email = 'Please enter a valid email address (e.g. name@example.com).';
        isValid = false;
      }
    }

    // 3. Password Mandatory
    if (!password) {
      errors.password = 'Password is required.';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
      isValid = false;
    }

    // 4. Number Validation (Optional)
    const trimmedNumber = number.trim();
    if (trimmedNumber) {
      const cleanDigits = trimmedNumber.replace(/\D/g, '');
      if (cleanDigits.length < 10 || cleanDigits.length > 15) {
        errors.number = 'Please enter a valid phone number (10 to 15 digits).';
        isValid = false;
      }
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setBusy(true);

    try {
      const response = await signupUser({
        name: name.trim(),
        gender,
        email: email.trim(),
        number: number.trim() || undefined,
        referral_code: referralCode.trim() || undefined,
        password: password,
      });

      if (response.error) {
        setError(response.error);
      } else if (response.user_id && response.session_token) {
        setAuthSession(
          {
            email: response.email || email.trim(),
            name: response.name || name.trim(),
          },
          response.session_token
        );
        router.push('/dashboard');
      } else {
        setError('Account creation could not be completed. Please try again.');
      }
    } catch {
      setError('An error occurred during signup. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#312E81] overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute -top-16 -left-16 w-60 h-60 rounded-full bg-blue-300/15 pointer-events-none blur-2xl" />
      <div className="absolute -bottom-20 -right-16 w-64 h-64 rounded-full bg-sky-400/18 pointer-events-none blur-2xl" />

      <div className="w-full max-w-lg z-10 my-auto">
        {/* Brand Header */}
        <Link
          href="/"
          className="flex flex-col items-center justify-center text-center mb-6 sm:mb-8 group hover:opacity-95 transition-opacity"
        >
          <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-blue-300 via-blue-500 to-blue-900 inline-flex items-center justify-center text-white shadow-xl mb-3 group-hover:scale-105 transition-transform shrink-0">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-outfit tracking-tight">
            Acuspeak
          </h1>
          <p className="text-white/80 text-sm mt-1 font-medium">
            Your personal English speaking coach
          </p>
        </Link>

        {/* Signup Card */}
        <div className="bg-white rounded-[28px] p-6 sm:p-8 shadow-2xl border border-white/50 w-full">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-2xl font-bold font-outfit text-slate-900 leading-snug">
                Create Account
              </h2>
              <p className="text-slate-500 text-xs font-medium mt-0.5">
                Join thousands of learners building fluency
              </p>
            </div>
            <Link
              href="/login"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3.5 py-2 rounded-full transition-colors"
            >
              Log In Instead
            </Link>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                ⚠️ {error}
              </div>
            )}

            {/* 1. Name Field (Mandatory) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="e.g. John Doe"
                className={`w-full h-12 rounded-xl bg-slate-100 border ${fieldErrors.name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-transparent'
                  } px-4 text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
              />
              {fieldErrors.name && (
                <span className="text-rose-600 text-xs font-semibold mt-1 block">
                  {fieldErrors.name}
                </span>
              )}
            </div>

            {/* 2. Gender Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['Male', 'Female', 'Other'] as const).map((option) => (
                  <label
                    key={option}
                    className={`flex items-center justify-center gap-2 h-11 px-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${gender === option
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm'
                        : 'bg-slate-100 border-transparent text-slate-600 hover:bg-slate-200/70'
                      }`}
                  >
                    <input
                      type="radio"
                      name="page-gender"
                      value={option}
                      checked={gender === option}
                      onChange={() => setGender(option)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Email & Phone Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Email Field (Mandatory) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  placeholder="name@example.com"
                  className={`w-full h-12 rounded-xl bg-slate-100 border ${fieldErrors.email ? 'border-rose-500 ring-1 ring-rose-500' : 'border-transparent'
                    } px-3.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                />
                {fieldErrors.email && (
                  <span className="text-rose-600 text-xs font-semibold mt-1 block">
                    {fieldErrors.email}
                  </span>
                )}
              </div>

              {/* Number Field (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="tel"
                  value={number}
                  onChange={(e) => {
                    setNumber(e.target.value);
                    if (fieldErrors.number) {
                      setFieldErrors((prev) => ({ ...prev, number: undefined }));
                    }
                  }}
                  placeholder="e.g. +91 9876543210"
                  className={`w-full h-12 rounded-xl bg-slate-100 border ${fieldErrors.number ? 'border-rose-500 ring-1 ring-rose-500' : 'border-transparent'
                    } px-3.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                />
                {fieldErrors.number && (
                  <span className="text-rose-600 text-xs font-semibold mt-1 block">
                    {fieldErrors.number}
                  </span>
                )}
              </div>
            </div>

            {/* 4. Password Field (Mandatory with Eye Toggle) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Create Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  placeholder="Set password (min. 6 characters)"
                  className={`w-full h-12 rounded-xl bg-slate-100 border ${fieldErrors.password ? 'border-rose-500 ring-1 ring-rose-500' : 'border-transparent'
                    } pl-4 pr-11 text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
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
              {fieldErrors.password && (
                <span className="text-rose-600 text-xs font-semibold mt-1 block">
                  {fieldErrors.password}
                </span>
              )}
            </div>

            {/* 5. Referral Code Field (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Referral Code <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Referral code if you have one"
                className="w-full h-12 rounded-xl bg-slate-100 border border-transparent px-4 text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 h-[52px] rounded-full bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#38BDF8] text-white font-semibold text-[15px] shadow-lg shadow-blue-900/20 hover:opacity-95 transition-opacity cursor-pointer leading-none mt-2"
            >
              {busy ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-xs text-slate-500 text-center mt-5 leading-relaxed font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-bold hover:underline">
              Log In
            </Link>
          </p>

          <p className="text-xs text-slate-400 text-center mt-4 leading-relaxed font-medium">
            By signing up you agree to our{' '}
            <Link
              href="/terms"
              className="text-blue-600 underline font-semibold hover:opacity-90"
            >
              Terms &amp; Conditions
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="text-blue-600 underline font-semibold hover:opacity-90"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
