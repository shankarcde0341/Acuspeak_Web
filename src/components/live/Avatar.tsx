import React from 'react';

export interface AvatarProps {
  name: string;
  size: number;
  tone: 'gold' | 'blue';
  className?: string;
}

export function Avatar({ name, size, tone, className = '' }: AvatarProps) {
  const initial = (name.charAt(0) || '?').toUpperCase();
  const background = tone === 'gold' ? 'var(--gradient-gold)' : 'var(--gradient-avatar-blue)';
  const fontSize = size * 0.4;

  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-outfit), sans-serif',
        fontWeight: 700,
        fontSize: `${fontSize}px`,
        lineHeight: 1,
        flexShrink: 0,
        userSelect: 'none',
      }}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}
