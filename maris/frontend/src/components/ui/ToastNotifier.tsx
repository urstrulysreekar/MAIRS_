'use client';

import React, { useEffect, useState } from 'react';
import { useDemoStore } from '@/lib/demo';
import { Anomaly } from '@/lib/demo/types';
import { HazardBadge, SeverityPill } from './Badge';
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

  const hasCoords = activeToast.latitude != null && activeToast.longitude != null;
  const coordsText =
    hasCoords ? `${activeToast.latitude!.toFixed(4)}°N, ${activeToast.longitude!.toFixed(4)}°E` : 'Not geotagged';
  const confidenceText =
    activeToast.confidence == null ? 'Conf N/A' : `${(activeToast.confidence * 100).toFixed(0)}% Conf`;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#101622] p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold tracking-widest text-[#3b7b99] uppercase">
              ● Live Acoustic Stream Alert
            </span>
          </div>

          <button
            onClick={() => setActiveToast(null)}
            className="text-[#8c978f] hover:text-[#e2e8e4]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="mt-2.5">
          <div className="flex items-center gap-2">
            <HazardBadge hazardClass={activeToast.hazardClass} size="sm" />
            <SeverityPill severity={activeToast.severity} />
          </div>
          <p className="mt-1.5 text-xs font-bold text-[#e2e8e4] leading-snug">{activeToast.label}</p>
          <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-[#8c978f]">
            <span className="flex items-center gap-1">
              <svg className="h-3 w-3 text-[#3b7b99]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx={12} cy={9} r={2.5}/></svg>
              {coordsText}
            </span>
            <span className="font-bold text-[#5b937c]">{confidenceText}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2 border-t border-[rgba(226,232,228,0.08)] pt-2 text-xs">
          {onSelectAnomaly ? (
            <button
              onClick={() => {
                onSelectAnomaly(activeToast);
                setActiveToast(null);
              }}
              className="font-bold text-[#3b7b99] hover:underline"
            >
              Inspect Target →
            </button>
          ) : hasCoords ? (
            <Link
              href={`/map?anomalyId=${activeToast.id}&lat=${activeToast.latitude}&lng=${activeToast.longitude}`}
              onClick={() => setActiveToast(null)}
              className="flex items-center gap-1 font-bold text-[#3b7b99] hover:underline"
            >
              Focus on Map ↗
            </Link>
          ) : (
            <span className="font-bold text-[#8c978f]">No geotag available</span>
          )}
        </div>
      </div>
    </div>
  );
}
