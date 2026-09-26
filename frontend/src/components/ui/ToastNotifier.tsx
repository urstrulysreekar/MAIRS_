'use client';

import React, { useEffect, useState } from 'react';
import { useDemoStore } from '@/lib/demo';
import { Anomaly } from '@/lib/demo/types';
import { HazardBadge, SeverityPill } from './Badge';
import { Radio, X, MapPin, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ToastNotifier({
  onSelectAnomaly,
}: {
  onSelectAnomaly?: (anomaly: Anomaly) => void;
}) {
  const { lastSimulatedAnomaly } = useDemoStore();
  const [activeToast, setActiveToast] = useState<Anomaly | null>(null);

  useEffect(() => {
    if (lastSimulatedAnomaly) {
      setActiveToast(lastSimulatedAnomaly);
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 4200);
      return () => clearTimeout(timer);
    }
  }, [lastSimulatedAnomaly]);

  if (!activeToast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="rounded-xl border border-cyan-500/50 bg-[#0d1627]/95 p-4 shadow-2xl shadow-cyan-500/20 backdrop-blur-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 animate-ping"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500"></span>
            </span>
            <span className="font-mono text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
              Live Acoustic Stream Alert
            </span>
          </div>

          <button
            onClick={() => setActiveToast(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2.5">
          <div className="flex items-center gap-2">
            <HazardBadge hazardClass={activeToast.hazardClass} size="sm" />
            <SeverityPill severity={activeToast.severity} />
          </div>
          <p className="mt-1.5 text-xs font-bold text-white leading-snug">{activeToast.label}</p>
          <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-cyan-400" />
              {activeToast.latitude.toFixed(4)}°N, {activeToast.longitude.toFixed(4)}°E
            </span>
            <span className="font-bold text-emerald-400">{(activeToast.confidence * 100).toFixed(0)}% Conf</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2 border-t border-[var(--color-border-subtle)] pt-2 text-xs">
          {onSelectAnomaly ? (
            <button
              onClick={() => {
                onSelectAnomaly(activeToast);
                setActiveToast(null);
              }}
              className="font-bold text-cyan-400 hover:underline"
            >
              Inspect Target →
            </button>
          ) : (
            <Link
              href={`/map?anomalyId=${activeToast.id}&lat=${activeToast.latitude}&lng=${activeToast.longitude}`}
              onClick={() => setActiveToast(null)}
              className="flex items-center gap-1 font-bold text-cyan-400 hover:underline"
            >
              Focus on Map <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
