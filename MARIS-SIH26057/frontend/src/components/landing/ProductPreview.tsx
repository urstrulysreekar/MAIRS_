'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useKPIMetrics, useFilteredAnomalies } from '@/lib/demo';
import { IS_DEMO_MODE } from '@/lib/app-mode';

export default function ProductPreview() {
  const kpi = useKPIMetrics();
  const { anomalies } = useFilteredAnomalies();
  const [selectedAnomalyIndex, setSelectedAnomalyIndex] = useState(0);

  const currentAnomaly = anomalies[selectedAnomalyIndex] || anomalies[0];

  return (
    <section id="workbench" className="relative py-20 px-4 sm:px-8 max-w-7xl mx-auto text-[#e2e8e4] border-b border-white/[0.08]">
      {/* Header */}
      <div className="space-y-4 max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 border border-white/[0.12] bg-[#101622] px-2.5 py-1 font-mono-inst text-[10px] uppercase tracking-widest text-[#8c978f]">
          <span>OPERATIONAL WORKBENCH PREVIEW</span>
        </div>
        <h2 className="font-editorial text-3xl sm:text-5xl font-normal tracking-tight text-[#e2e8e4] leading-tight">
          Live acoustic signal inspector.
        </h2>
        <p className="text-sm sm:text-base text-[#8c978f] leading-relaxed">
          Inspect multi-channel acoustic backscatter signatures, bounding box geometry, and sub-meter PostGIS geolocations directly from seeded survey runs.
        </p>
      </div>

      {/* Structural Telemetry Workbench (Replaces Fake Browser Window) */}
      <div className="border border-white/[0.12] bg-[#0b1018] font-mono-inst text-xs overflow-hidden">
        {/* Top Instrument Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] bg-[#101622] px-5 py-3 gap-4 overflow-hidden">
          <div className="flex items-center gap-4 min-w-0 max-w-full overflow-hidden">
            <span className="font-semibold text-[#e2e8e4] uppercase tracking-wider shrink-0">
              DATA STREAM: ACTIVE SENSOR INGEST
            </span>
            <span className="text-[#8c978f] border-l border-white/[0.08] pl-4">
              SESSION : GULF_OF_MANNAR_LINE_04
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] shrink-0">
            <span className="flex items-center gap-1.5 text-[#5b937c]">
              <span className="h-1.5 w-1.5 bg-[#5b937c]" />
              <span>POSTGIS GEO-LOCKED</span>
            </span>
            <Link
              href="/console"
              className="border border-white/20 bg-[#161e2e] px-3 py-1 text-[#e2e8e4] hover:bg-white/10 transition-colors"
            >
              LAUNCH FULL CONSOLE &rarr;
            </Link>
          </div>
        </div>

        {/* Workbench Body */}
        <div className="grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08] overflow-hidden">
          {/* Left Column: Queued Anomaly List */}
          <div className="lg:col-span-5 p-4 space-y-2 max-h-96 overflow-y-auto overflow-x-hidden">
            <div className="text-[10px] uppercase text-[#8c978f] tracking-wider mb-2 truncate">
              REAL-TIME DETECTIONS QUEUE ({anomalies.length} TARGETS)
            </div>

            {anomalies.slice(0, 5).map((anom, idx) => (
              <button
                key={anom.id}
                type="button"
                onClick={() => setSelectedAnomalyIndex(idx)}
                className={`w-full text-left p-3 border transition-colors overflow-hidden ${
                  selectedAnomalyIndex === idx
                    ? 'border-white/40 bg-[#161e2e] text-[#e2e8e4]'
                    : 'border-white/[0.06] bg-[#070a0f] text-[#8c978f] hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 overflow-hidden">
                  <span className="font-semibold text-xs text-[#e2e8e4] uppercase truncate min-w-0">
                    {anom.label}
                  </span>
                  <span className="text-[10px] text-[#d93829] tabular-nums shrink-0">
                    {anom.confidence == null ? 'CONF N/A' : `${(anom.confidence * 100).toFixed(1)}% CONF`}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-[#8c978f] overflow-hidden">
                  <span className="truncate min-w-0">ZONE: {anom.zone}</span>
                  <span className="shrink-0">DEPTH: {anom.depthM == null ? 'N/A' : `${anom.depthM}m`}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Right Column: Selected Target Deep Telemetry */}
          {currentAnomaly && (
            <div className="lg:col-span-7 p-6 space-y-6 overflow-hidden">
              <div className="flex items-start justify-between border-b border-white/[0.08] pb-4 gap-4 overflow-hidden">
                <div className="min-w-0 flex-1 overflow-hidden pr-2">
                  <div className="text-sm font-semibold text-[#e2e8e4] uppercase truncate break-all">
                    {currentAnomaly.label}
                  </div>
                  <div className="text-[11px] text-[#8c978f] mt-0.5 truncate break-all font-mono">
                    GEODETIC ID: {currentAnomaly.id}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block border border-[#d93829]/40 bg-[#d93829]/10 text-[#d93829] text-[10px] px-2.5 py-0.5 font-semibold">
                    STATUS: UNVERIFIED
                  </span>
                </div>
              </div>

              {/* Monospace Key-Value Coordinates Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 overflow-hidden">
                <div className="border border-white/[0.06] bg-[#101622] p-2.5 overflow-hidden">
                  <span className="text-[9px] text-[#8c978f] block uppercase truncate">LATITUDE</span>
                  <span className="text-[#e2e8e4] font-semibold tabular-nums mt-0.5 block truncate">
                    {currentAnomaly.latitude == null ? 'Not recorded' : `${currentAnomaly.latitude.toFixed(5)}°N`}
                  </span>
                </div>

                <div className="border border-white/[0.06] bg-[#101622] p-2.5 overflow-hidden">
                  <span className="text-[9px] text-[#8c978f] block uppercase truncate">LONGITUDE</span>
                  <span className="text-[#e2e8e4] font-semibold tabular-nums mt-0.5 block truncate">
                    {currentAnomaly.longitude == null ? 'Not recorded' : `${currentAnomaly.longitude.toFixed(5)}°E`}
                  </span>
                </div>

                <div className="border border-white/[0.06] bg-[#101622] p-2.5 overflow-hidden">
                  <span className="text-[9px] text-[#8c978f] block uppercase truncate">BATHYMETRY</span>
                  <span className="text-[#e2e8e4] font-semibold tabular-nums mt-0.5 block truncate">
                    {currentAnomaly.depthM == null ? 'Not recorded' : `${currentAnomaly.depthM} METERS`}
                  </span>
                </div>

                <div className="border border-white/[0.06] bg-[#101622] p-2.5 overflow-hidden">
                  <span className="text-[9px] text-[#8c978f] block uppercase truncate">PRECISION</span>
                  <span className="text-[#5b937c] font-semibold tabular-nums mt-0.5 block truncate">
                    {IS_DEMO_MODE ? '±0.38 METER' : 'Not recorded'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                <Link
                  href={`/map?anomalyId=${currentAnomaly.id}`}
                  className="border border-[#e2e8e4] bg-[#e2e8e4] text-[#070a0f] px-4 py-2 font-semibold hover:bg-transparent hover:text-[#e2e8e4] transition-colors"
                >
                  TRACK ON POSTGIS MAP &rarr;
                </Link>
                <Link
                  href="/reports"
                  className="border border-white/20 bg-[#101622] text-[#e2e8e4] px-4 py-2 hover:border-white/50 transition-colors"
                >
                  GENERATE DOSSIER
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
