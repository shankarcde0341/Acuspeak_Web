'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export interface BrandLogoProps {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  textClassName?: string;
  showText?: boolean;
  smoothScroll?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Reusable Brand Logo component with accessible routing and smooth scroll-to-top behavior.
 * When clicked from the same page, smoothly scrolls back to (0, 0).
 * When clicked from other pages, navigates to the target page and lands at the top.
 */
export default function BrandLogo({
  href = '/',
  size = 'md',
  className = '',
  textClassName = '',
  showText = true,
  smoothScroll = true,
  onClick,
}: BrandLogoProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
      if (e.defaultPrevented) return;
    }

    // If user is already on the destination page, trigger a smooth scroll to top
    if (pathname === href) {
      e.preventDefault();
      if (typeof window !== 'undefined') {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: smoothScroll ? 'smooth' : 'auto',
        });
      }
      return;
    }

    // If navigating to another page, Next.js <Link> navigates and resets scroll
  };

  // Dimensions based on size preset
  const sizeMap = {
    sm: {
      box: 'w-5 h-5 rounded-[6px] text-[10px]',
      text: 'text-base',
      gap: 'gap-2',
    },
    md: {
      box: 'w-[34px] h-[34px] rounded-[10px] text-[16px]',
      text: 'text-xl',
      gap: 'gap-2.5',
    },
    lg: {
      box: 'w-14 h-14 rounded-[18px] text-[24px]',
      text: 'text-2xl sm:text-3xl',
      gap: 'gap-3',
    },
  }[size];

  return (
    <Link
      href={href}
      onClick={handleClick}
      scroll={true}
      aria-label="Acuspeak - Back to Home"
      className={`inline-flex items-center ${sizeMap.gap} font-bold font-outfit text-[var(--text-primary)] hover:opacity-90 transition-opacity cursor-pointer select-none ${className}`}
    >
      <div
        className={`${sizeMap.box} bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#38BDF8] inline-flex items-center justify-center text-white font-bold shrink-0 font-outfit shadow-sm`}
        aria-hidden="true"
      >
        A
      </div>
      {showText && (
        <span className={`tracking-tight ${sizeMap.text} ${textClassName}`}>
          Acuspeak
        </span>
      )}
    </Link>
  );
}
