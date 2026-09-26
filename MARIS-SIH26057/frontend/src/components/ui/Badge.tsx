'use client';

import React from 'react';
import { HazardClass, Severity, ReviewStatus } from '@/lib/demo/types';
import clsx from 'clsx';

// Bespoke Instrument SVG Icons
const ShieldAlertIcon = ({ className = 'h-3.5 w-3.5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.007v.008H12v-.008zM12 3c7.2 0 9 1.8 9 9 0 7.2-6 9.6-9 10.8C9 21.6 3 19.2 3 12c0-7.2 1.8-9 9-9z" />
  </svg>
);

const AnchorIcon = ({ className = 'h-3.5 w-3.5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="5" r="2.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5V20m-7-5c0 3.866 3.134 7 7 7s7-3.134 7-7M5 15H3m18 0h-2" />
  </svg>
);

const BombIcon = ({ className = 'h-3.5 w-3.5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="11" cy="13" r="7" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m16 8 4-4m-2 0h2v2M8.5 10.5 10 12" />
  </svg>
);

const CableIcon = ({ className = 'h-3.5 w-3.5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 17s3-3 8-3 8 3 8 3M4 11s3-3 8-3 8 3 8 3M4 5s3-3 8-3 8 3 8 3" />
  </svg>
);

const ReefIcon = ({ className = 'h-3.5 w-3.5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-7m-4 7v-4a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v4M8 10a4 4 0 1 1 8 0c0 2-2 4-4 4s-4-2-4-4z" />
  </svg>
);

const LayersIcon = ({ className = 'h-3.5 w-3.5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const AlertTriangleIcon = ({ className = 'h-3 w-3' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 6.375a1.5 1.5 0 0 0 1.299 2.25h16.008a1.5 1.5 0 0 0 1.3-2.25L13.3 3.375a1.5 1.5 0 0 0-2.6 0L2.697 19.125zM12 18h.008v.008H12V18z" />
  </svg>
);

const ClockIcon = ({ className = 'h-3 w-3' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
  </svg>
);

const CheckCircleIcon = ({ className = 'h-3 w-3' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.5 12.5 2.5 2.5 5-5" />
  </svg>
);

const DispatchIcon = ({ className = 'h-3 w-3' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.486 12 59.768 59.768 0 0 1 3.27 20.875L6 12zm0 0h7.5" />
  </svg>
);

const ClearedIcon = ({ className = 'h-3 w-3' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
  </svg>
);

export const HAZARD_DISPLAY_CONFIG: Record<
  HazardClass,
  { label: string; color: string; bg: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  ghost_net: {
    label: 'Ghost Net',
    color: '#d93829',
    bg: 'bg-[#101622]',
    border: 'border-[rgba(226,232,228,0.08)]',
    icon: ShieldAlertIcon,
  },
  wreck_debris: {
    label: 'Wreck Debris',
    color: '#3b7b99',
    bg: 'bg-[#101622]',
    border: 'border-[rgba(226,232,228,0.08)]',
    icon: AnchorIcon,
  },
  uxo: {
    label: 'UXO / Munition',
    color: '#d93829',
    bg: 'bg-[#101622]',
    border: 'border-[rgba(226,232,228,0.08)]',
    icon: BombIcon,
  },
  pipeline: {
    label: 'Pipeline / Cable',
    color: '#8c978f',
    bg: 'bg-[#101622]',
    border: 'border-[rgba(226,232,228,0.08)]',
    icon: CableIcon,
  },
  biological: {
    label: 'Biological Reef',
    color: '#5b937c',
    bg: 'bg-[#101622]',
    border: 'border-[rgba(226,232,228,0.08)]',
    icon: ReefIcon,
  },
  geological: {
    label: 'Geological Bed',
    color: '#4d5750',
    bg: 'bg-[#101622]',
    border: 'border-[rgba(226,232,228,0.08)]',
    icon: LayersIcon,
  },
  unknown: {
    label: 'Unknown Class',
    color: '#8c978f',
    bg: 'bg-[#101622]',
    border: 'border-[rgba(226,232,228,0.08)]',
    icon: LayersIcon,
  },
};

export function HazardBadge({
  hazardClass,
  size = 'md',
  showIcon = true,
}: {
  hazardClass: HazardClass;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}) {
  const conf = HAZARD_DISPLAY_CONFIG[hazardClass] || HAZARD_DISPLAY_CONFIG.geological;
  const Icon = conf.icon;

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px] gap-1 font-mono',
    md: 'px-2 py-0.5 text-xs gap-1.5 font-semibold',
    lg: 'px-3 py-1 text-sm gap-2 font-bold',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-sm border transition-colors',
        conf.bg,
        conf.border,
        sizeClasses[size]
      )}
      style={{ color: conf.color }}
    >
      {showIcon && <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />}
      <span>{conf.label}</span>
    </span>
  );
}

export function SeverityPill({ severity }: { severity: Severity }) {
  const configs: Record<Severity, { label: string; color: string; bg: string; dot: string }> = {
    critical: { label: 'CRITICAL', color: 'text-[#d93829]', bg: 'bg-[#101622] border-[rgba(226,232,228,0.08)]', dot: 'bg-[#d93829]' },
    high: { label: 'HIGH', color: 'text-[#d99b26]', bg: 'bg-[#101622] border-[rgba(226,232,228,0.08)]', dot: 'bg-[#d99b26]' },
    medium: { label: 'MEDIUM', color: 'text-[#3b7b99]', bg: 'bg-[#101622] border-[rgba(226,232,228,0.08)]', dot: 'bg-[#3b7b99]' },
    low: { label: 'LOW', color: 'text-[#4d5750]', bg: 'bg-[#101622] border-[rgba(226,232,228,0.08)]', dot: 'bg-[#4d5750]' },
    unrated: { label: 'UNRATED', color: 'text-[#8c978f]', bg: 'bg-[#101622] border-[rgba(226,232,228,0.08)]', dot: 'bg-[#8c978f]' },
  };

  const c = configs[severity] || configs.low;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase',
        c.bg,
        c.color
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-sm', c.dot)}></span>
      {c.label}
    </span>
  );
}

export function StatusChip({ status }: { status: ReviewStatus }) {
  const configs: Record<ReviewStatus, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
    new: { label: 'New Detection', color: 'text-[#3b7b99]', bg: 'bg-[#101622] border-[rgba(226,232,228,0.08)]', icon: AlertTriangleIcon },
    under_review: { label: 'Under Review', color: 'text-[#d99b26]', bg: 'bg-[#101622] border-[rgba(226,232,228,0.08)]', icon: ClockIcon },
    verified: { label: 'Verified Target', color: 'text-[#5b937c]', bg: 'bg-[#101622] border-[rgba(226,232,228,0.08)]', icon: CheckCircleIcon },
    dispatched: { label: 'Team Dispatched', color: 'text-[#3b7b99]', bg: 'bg-[#101622] border-[rgba(226,232,228,0.08)]', icon: DispatchIcon },
    cleared: { label: 'Hazard Cleared', color: 'text-[#4d5750]', bg: 'bg-[#101622] border-[rgba(226,232,228,0.08)]', icon: ClearedIcon },
  };

  const c = configs[status] || configs.new;
  const Icon = c.icon;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 font-mono text-[11px] font-semibold',
        c.bg,
        c.color
      )}
    >
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
}
