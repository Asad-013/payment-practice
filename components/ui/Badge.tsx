// components/ui/Badge.tsx
import React from 'react';

type BadgeStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

interface BadgeProps {
  status: BadgeStatus | string;
}

export function Badge({ status }: BadgeProps) {
  const getBadgeConfig = (value: string) => {
    const norm = value.toLowerCase();
    switch (norm) {
      case 'completed':
        return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' };
      case 'processing':
        return { bg: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' };
      case 'failed':
      case 'cancelled':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' };
      case 'pending':
      default:
        return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' };
    }
  };

  const config = getBadgeConfig(status);

  return (
    <span
      style={{
        background: config.bg,
        color: config.color,
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.85rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        display: 'inline-block',
      }}
    >
      {status}
    </span>
  );
}
