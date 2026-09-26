'use client';

import React from 'react';
import { useKPIMetrics, useFilteredAnomalies } from '@/lib/demo';

export default function StatsBand() {
  const kpi = useKPIMetrics();
  const { anomalies } = useFilteredAnomalies();

  const metrics = [
    {
      value: `${anomalies.length}`,
      label: 'ISOLATED TARGETS',
      detail: 'Ghost nets, UXO & wreck debris',
    },
    {
      value: `${kpi.totalSurveys}`,
      label: 'SURVEY PROFILES',
      detail: 'Dual-frequency XTF / JSF logs',
    },
    {
      value: `${kpi.totalAreaCoveredKm2}`,
      label: 'SURVEYED AREA [KM²]',
      detail: 'Motion-corrected swath bathymetry',
    },
    {
      value: `${(kpi.avgConfidence * 100).toFixed(1)}%`,
      label: 'MEAN PRECISION',
      detail: 'mAP50 DySample acoustic score',
    },
  ];

  return (
    <section className="relative py-16 border-b border-white/[0.08] bg-[#070a0f] text-[#e2e8e4] font-mono-inst">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
          {metrics.map((m, idx) => (
            <div key={m.label} className={`space-y-1.5 ${idx !== 0 ? 'pt-4 lg:pt-0 lg:pl-6' : ''}`}>
              <div
                suppressHydrationWarning
                className="text-3xl sm:text-4xl font-semibold tabular-nums text-[#e2e8e4]"
              >
                {m.value}
              </div>
              <div className="text-xs font-semibold text-[#8c978f] uppercase tracking-wider">
                {m.label}
              </div>
              <div className="text-[11px] text-[#4d5750]">
                {m.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
