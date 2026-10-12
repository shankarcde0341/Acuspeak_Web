'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signupUser, setAuthSession } from '@/services/authService';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

export default function SignupModal({ isOpen, onClose, onSwitchToLogin }: SignupModalProps) {
  const router = useRouter();

  // Form Fields
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [email, setEmail] = useState('');
  const [number, setNumber] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI States
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    number?: string;
  }>({});

  // Reset errors when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setFieldErrors({});
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Validation function
  const validate = (): boolean => {
    const errors: { name?: string; email?: string; password?: string; number?: string } = {};
    let isValid = true;

    // 1. Name is Mandatory
    if (!name.trim()) {
      errors.name = 'Full name is required.';
      isValid = false;
    }

    // 2. Email Address is Mandatory
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        errors.email = 'Please enter a valid email address (e.g. user@domain.com).';
        isValid = false;
      }
    }

    // 3. Password is Mandatory
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

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
        // Successfully created account
        setAuthSession(
          {
            email: response.email || email.trim(),
            name: response.name || name.trim(),
          },
          response.session_token
        );

        onClose();
        router.push('/dashboard');
      } else {
        setError('Account creation could not be completed. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred during signup. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-white rounded-[28px] shadow-2xl border border-slate-100 p-6 sm:p-8 overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Decorative Gradient Orbs */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-blue-500/10 pointer-events-none blur-xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-teal-500/10 pointer-events-none blur-xl" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3">
            <span>🚀</span> Join Acuspeak Today
          </div>
          <h2 className="text-2xl font-bold font-outfit text-slate-900 tracking-tight">
            Create Your Account
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Start practicing live English conversations with AI and real partners.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold leading-relaxed">
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
              placeholder="e.g. Alex Morgan"
              className={`w-full h-11 rounded-xl bg-slate-50 border ${
                fieldErrors.name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200'
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
                  className={`flex items-center justify-center gap-2 h-11 px-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
                    gender === option
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="gender"
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
                className={`w-full h-11 rounded-xl bg-slate-50 border ${
                  fieldErrors.email ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200'
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
                className={`w-full h-11 rounded-xl bg-slate-50 border ${
                  fieldErrors.number ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200'
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
                className={`w-full h-11 rounded-xl bg-slate-50 border ${
                  fieldErrors.password ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200'
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
              placeholder="Enter code e.g. FRIEND2026"
              className="w-full h-11 rounded-xl bg-slate-50 border border-slate-200 px-4 text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={busy}
            className="w-full h-12 mt-2 rounded-full bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#38BDF8] text-white font-semibold text-[15px] shadow-lg shadow-blue-900/20 hover:opacity-95 transition-opacity cursor-pointer leading-none flex items-center justify-center gap-2"
          >
            {busy ? (
              <>
                <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Creating Account...</span>
              </>
            ) : (
              'Sign Up'
            )}
          </button>

          {/* Switch to Login link */}
          {onSwitchToLogin && (
            <p className="text-center text-xs text-slate-500 mt-3 font-medium">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Log In
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
