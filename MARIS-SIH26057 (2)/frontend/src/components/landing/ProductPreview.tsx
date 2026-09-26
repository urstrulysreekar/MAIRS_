'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Maximize2,
  Radio,
  Map as MapIcon,
  Shield,
  Activity,
  Layers,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useKPIMetrics, useFilteredAnomalies } from '@/lib/demo';
import { HazardBadge, SeverityPill } from '@/components/ui/Badge';

export default function ProductPreview() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const kpi = useKPIMetrics();
  const { anomalies } = useFilteredAnomalies();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const ny = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setTilt({ x: ny * -4, y: nx * 4 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <section id="preview" className="relative py-28 px-6 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="space-y-4 max-w-3xl mb-16 text-center mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0c1022]/80 px-3.5 py-1 text-xs font-mono font-medium text-cyan-400 backdrop-blur-md">
          <Activity className="h-3.5 w-3.5" />
          <span>LIVE MISSION CONSOLE · POSTGIS INTEGRATED</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          Tactical Operations at Sea
        </h2>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
          High-performance operations console delivering real-time telemetry streaming, interactive PostGIS swath
          visualizations, and deterministic anomaly triage across Indian maritime corridors.
        </p>
      </div>

      {/* Browser Mockup Window with 3D Tilt */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.2s ease-out',
        }}
        className="relative rounded-3xl border border-white/15 bg-[#080d1e]/90 shadow-[0_20px_70px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-2xl"
      >
        {/* Soft Ring Glow Backdrop */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[40%] rounded-full blur-[90px] bg-cyan-500/15 pointer-events-none" />

        {/* Browser Top Chrome */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#050814] px-6 py-3.5">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
            <span className="font-mono text-xs text-slate-400 ml-3 hidden sm:inline">
              maris.navy.in/console · Gulf of Mannar Sector #4
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              100% OPERATIONAL
            </span>
            <Link
              href="/console"
              className="flex items-center gap-1 font-mono text-xs text-cyan-400 hover:text-cyan-300"
            >
              <span>Full Screen</span>
              <Maximize2 className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Mockup Dashboard Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Top KPI Metrics Preview Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-white/10 bg-[#0d1428] p-4">
              <span className="font-mono text-[10px] uppercase text-slate-400">Total Detections</span>
              <p suppressHydrationWarning className="font-mono text-2xl font-black text-white mt-1">
                {anomalies.length}
              </p>
              <span className="font-mono text-[10px] text-cyan-400">+18% this week</span>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0d1428] p-4">
              <span className="font-mono text-[10px] uppercase text-slate-400">Ghost Nets</span>
              <p suppressHydrationWarning className="font-mono text-2xl font-black text-rose-400 mt-1">
                {anomalies.filter((a) => a.hazardClass === 'ghost_net').length}
              </p>
              <span className="font-mono text-[10px] text-rose-300">Active Remediation</span>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0d1428] p-4">
              <span className="font-mono text-[10px] uppercase text-slate-400">Avg Confidence</span>
              <p suppressHydrationWarning className="font-mono text-2xl font-black text-amber-300 mt-1">
                {(kpi.avgConfidence * 100).toFixed(1)}%
              </p>
              <span className="font-mono text-[10px] text-slate-400">DySample FPN</span>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0d1428] p-4">
              <span className="font-mono text-[10px] uppercase text-slate-400">Area Mapped</span>
              <p suppressHydrationWarning className="font-mono text-2xl font-black text-purple-300 mt-1">
                {kpi.totalAreaCoveredKm2} <span className="text-xs font-normal text-slate-400">km²</span>
              </p>
              <span className="font-mono text-[10px] text-purple-300">200m swath</span>
            </div>
          </div>

          {/* Telemetry Target List Preview */}
          <div className="rounded-2xl border border-white/10 bg-[#090e20] p-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
                <span className="font-mono text-xs font-bold text-white uppercase">
                  Live Anomaly Telemetry Feed
                </span>
              </div>
              <Link href="/anomalies" className="font-mono text-xs text-cyan-400 hover:underline">
                View Full Catalog →
              </Link>
            </div>

            <div className="space-y-2">
              {anomalies.slice(0, 4).map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-white/5 bg-[#050814] hover:bg-[#0c142c] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HazardBadge hazardClass={item.hazardClass} size="sm" />
                    <span className="font-bold text-xs text-white truncate max-w-[180px] sm:max-w-xs">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 font-mono text-[11px]">
                    <span className="text-slate-400 hidden sm:inline">{item.zone}</span>
                    <span className="text-emerald-400 font-bold">{(item.confidence * 100).toFixed(0)}%</span>
                    <SeverityPill severity={item.severity} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Launch Buttons in Preview */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
              <Shield className="h-4 w-4 text-cyan-400" />
              <span>Real-time deterministic simulation mode active</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/map"
                className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition-colors"
              >
                <MapIcon className="h-4 w-4 text-cyan-400" />
                <span>Open Swath Map</span>
              </Link>
              <Link
                href="/console"
                className="flex items-center gap-1.5 rounded-xl bg-cyan-400 px-5 py-2 text-xs font-bold text-black hover:bg-cyan-300 transition-colors"
              >
                <span>Launch Full Console</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
