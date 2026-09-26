'use client';

import React from 'react';
import { HazardClass, Severity, ReviewStatus } from '@/lib/demo/types';
import {
  ShieldAlert,
  Anchor,
  Bomb,
  Radio,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  CheckCheck,
  AlertCircle,
} from 'lucide-react';
import clsx from 'clsx';

export const HAZARD_DISPLAY_CONFIG: Record<
  HazardClass,
  { label: string; color: string; bg: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  ghost_net: {
    label: 'Ghost Net',
    color: '#00f0ff',
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-500/40',
    icon: ShieldAlert,
  },
  wreck_debris: {
    label: 'Wreck Debris',
    color: '#38bdf8',
    bg: 'bg-sky-500/15',
    border: 'border-sky-500/40',
    icon: Anchor,
  },
  uxo: {
    label: 'UXO / Munition',
    color: '#ff3b5c',
    bg: 'bg-rose-500/15',
    border: 'border-rose-500/40',
    icon: Bomb,
  },
  pipeline: {
    label: 'Pipeline / Cable',
    color: '#a855f7',
    bg: 'bg-purple-500/15',
    border: 'border-purple-500/40',
    icon: Radio,
  },
  biological: {
    label: 'Biological Reef',
    color: '#10b981',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/40',
    icon: Sparkles,
  },
  geological: {
    label: 'Geological Bed',
    color: '#94a3b8',
    bg: 'bg-slate-500/15',
    border: 'border-slate-500/40',
    icon: Layers,
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
        'inline-flex items-center rounded-md border backdrop-blur-md transition-colors',
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
    critical: { label: 'CRITICAL', color: 'text-rose-300', bg: 'bg-rose-950/60 border-rose-500/50', dot: 'bg-rose-500 animate-pulse' },
    high: { label: 'HIGH', color: 'text-amber-300', bg: 'bg-amber-950/60 border-amber-500/50', dot: 'bg-amber-400' },
    medium: { label: 'MEDIUM', color: 'text-sky-300', bg: 'bg-sky-950/60 border-sky-500/50', dot: 'bg-sky-400' },
    low: { label: 'LOW', color: 'text-slate-300', bg: 'bg-slate-900/60 border-slate-700/50', dot: 'bg-slate-400' },
  };

  const c = configs[severity] || configs.low;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase',
        c.bg,
        c.color
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', c.dot)}></span>
      {c.label}
    </span>
  );
}

export function StatusChip({ status }: { status: ReviewStatus }) {
  const configs: Record<ReviewStatus, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
    new: { label: 'New Detection', color: 'text-cyan-300', bg: 'bg-cyan-950/50 border-cyan-500/40', icon: AlertCircle },
    under_review: { label: 'Under Review', color: 'text-amber-300', bg: 'bg-amber-950/50 border-amber-500/40', icon: Clock },
    verified: { label: 'Verified Target', color: 'text-emerald-300', bg: 'bg-emerald-950/50 border-emerald-500/40', icon: CheckCircle2 },
    dispatched: { label: 'Team Dispatched', color: 'text-purple-300', bg: 'bg-purple-950/50 border-purple-500/40', icon: Send },
    cleared: { label: 'Hazard Cleared', color: 'text-slate-400', bg: 'bg-slate-900/50 border-slate-700/40', icon: CheckCheck },
  };

  const c = configs[status] || configs.new;
  const Icon = c.icon;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold',
        c.bg,
        c.color
      )}
    >
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
}
