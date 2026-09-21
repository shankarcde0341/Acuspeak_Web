'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const sessionToken = searchParams.get('session_token');
    const email = searchParams.get('email');
    const name = searchParams.get('name');
    const err = searchParams.get('error');

    if (err) {
      setErrorMsg(err);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      return;
    }

    if (sessionToken && email) {
      // Store non-sensitive user profile & session token securely on client
      localStorage.setItem('session_token', sessionToken);
      localStorage.setItem(
        'acuspeak_user',
        JSON.stringify({
          email: email,
          name: name || 'User',
        })
      );

      // Redirect user to dashboard
      router.push('/dashboard');
    } else {
      setErrorMsg('Invalid authentication response from server.');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  }, [searchParams, router]);

  if (errorMsg) {
    return (
      <div className="bg-white rounded-[28px] p-6 sm:p-8 shadow-2xl border border-white/50 w-full max-w-md text-center">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
          ✕
        </div>
        <h2 className="text-xl font-bold font-outfit text-slate-900 mb-2">
          Authentication Error
        </h2>
        <p className="text-slate-600 text-sm mb-6">{errorMsg}</p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[28px] p-6 sm:p-8 shadow-2xl border border-white/50 w-full max-w-md text-center">
      <div className="flex justify-center mb-5">
        <svg
          className="animate-spin h-10 w-10 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-bold font-outfit text-slate-900 mb-1">
        Authenticating with Google
      </h2>
      <p className="text-slate-600 text-sm font-medium">
        Securing your session and loading your profile...
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#312E81] overflow-hidden font-sans">
      <Suspense
        fallback={
          <div className="bg-white rounded-[28px] p-6 sm:p-8 shadow-2xl border border-white/50 w-full max-w-md text-center">
            <p className="text-slate-600 text-sm font-medium">Loading...</p>
          </div>
        }
      >
        <CallbackContent />
      </Suspense>
    </div>
  );
}
