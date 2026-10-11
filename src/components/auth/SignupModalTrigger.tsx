'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SignupModal from './SignupModal';

interface SignupModalTriggerProps {
  buttonText: string;
  className?: string;
}

export default function SignupModalTrigger({ buttonText, className }: SignupModalTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className}
      >
        {buttonText}
      </button>

      <SignupModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSwitchToLogin={() => {
          setIsOpen(false);
          router.push('/login');
        }}
      />
    </>
  );
}
