'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Anchor,
  Compass,
  FileUp,
  Map as MapIcon,
  ShieldAlert,
  Sliders,
  Cpu,
  ArrowUpRight,
  Radio,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Send,
  Eye,
  Zap,
} from 'lucide-react';
import { useDemoStore, useFilteredAnomalies, useKPIMetrics, demoStore } from '@/lib/demo';
import { Anomaly, HazardClass } from '@/lib/demo/types';
import AnimatedText from '@/components/AnimatedText';
import GlobalFilterBar from '@/components/ui/GlobalFilterBar';
import { HazardBadge, SeverityPill, StatusChip } from '@/components/ui/Badge';
import DetailDrawer from '@/components/ui/DetailDrawer';
import SonarThumbnail from '@/components/ui/SonarThumbnail';
import clsx from 'clsx';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from 'recharts';

// Lazy-load the WebGL 3D Canvas
const Scene3D = dynamic(() => import('@/components/canvas/Scene3D'), {
  ssr: false,
  loading: () => null,
});

export default function ConsoleCommandCenter() {
  const { jobs, alerts } = useDemoStore();
  const { anomalies, totalUnfiltered } = useFilteredAnomalies();
  const kpi = useKPIMetrics();

  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [timeSeriesRange, setTimeSeriesRange] = useState<'24h' | '7d' | '30d'>('7d');

  // Compute Taxonomy Distribution from current filtered anomalies
  const taxonomyData = useMemo(() => {
    const counts: Record<HazardClass, number> = {
      ghost_net: 0,
      wreck_debris: 0,
      geological: 0,
      biological: 0,
      pipeline: 0,
      uxo: 0,
    };

    anomalies.forEach((a) => {
      if (counts[a.hazardClass] !== undefined) {
        counts[a.hazardClass]++;
      }
    });

    const colors: Record<HazardClass, string> = {
      ghost_net: '#00f0ff',
      wreck_debris: '#38bdf8',
      uxo: '#ff3b5c',
      pipeline: '#a855f7',
      biological: '#10b981',
      geological: '#94a3b8',
    };

    const labels: Record<HazardClass, string> = {
      ghost_net: 'Ghost Nets',
      wreck_debris: 'Wreck Debris',
      uxo: 'UXO / Munitions',
      pipeline: 'Pipelines / Cables',
      biological: 'Coral Reefs',
      geological: 'Geological Bed',
    };

    return Object.entries(counts).map(([k, count]) => ({
      name: labels[k as HazardClass],
      value: count,
      color: colors[k as HazardClass],
      key: k,
    }));
  }, [anomalies]);

  // Compute Detections Over Time series
  const timeSeriesData = useMemo(() => {
    if (timeSeriesRange === '24h') {
      return [
        { time: '00:00', detections: 12, ghostNets: 4 },
        { time: '04:00', detections: 18, ghostNets: 6 },
        { time: '08:00', detections: 29, ghostNets: 9 },
        { time: '12:00', detections: 44, ghostNets: 15 },
        { time: '16:00', detections: 38, ghostNets: 12 },
        { time: '20:00', detections: 52, ghostNets: 18 },
        { time: 'Now', detections: Math.min(60, (anomalies.length % 50) + 15), ghostNets: Math.round(anomalies.length * 0.28) },
      ];
    } else if (timeSeriesRange === '7d') {
      return [
        { time: 'Mon', detections: 38, ghostNets: 11 },
        { time: 'Tue', detections: 45, ghostNets: 14 },
        { time: 'Wed', detections: 52, ghostNets: 16 },
        { time: 'Thu', detections: 68, ghostNets: 21 },
        { time: 'Fri', detections: 74, ghostNets: 24 },
        { time: 'Sat', detections: 89, ghostNets: 28 },
        { time: 'Sun', detections: anomalies.length, ghostNets: Math.round(anomalies.length * 0.28) },
      ];
    } else {
      return [
        { time: 'Week 1', detections: 95, ghostNets: 29 },
        { time: 'Week 2', detections: 164, ghostNets: 48 },
        { time: 'Week 3', detections: 240, ghostNets: 69 },
        { time: 'Week 4', detections: anomalies.length, ghostNets: Math.round(anomalies.length * 0.28) },
      ];
    }
  }, [timeSeriesRange, anomalies.length]);

  // Confidence Distribution Histogram
  const confidenceBins = useMemo(() => {
    const bins = [
      { bin: '70-75%', count: 0 },
      { bin: '75-80%', count: 0 },
      { bin: '80-85%', count: 0 },
      { bin: '85-90%', count: 0 },
      { bin: '90-95%', count: 0 },
      { bin: '95-100%', count: 0 },
    ];

    anomalies.forEach((a) => {
      const c = a.confidence * 100;
      if (c < 75) bins[0].count++;
      else if (c < 80) bins[1].count++;
      else if (c < 85) bins[2].count++;
      else if (c < 90) bins[3].count++;
      else if (c < 95) bins[4].count++;
      else bins[5].count++;
    });

    return bins;
  }, [anomalies]);

  return (
    <div className="relative min-h-screen space-y-6 pb-16">
      {/* ── Fixed 3D WebGL Background ── */}
      <div className="fixed inset-0 z-0 h-screen w-screen overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#060a12]/50 to-[#060a12] z-10"></div>
        <div className="pointer-events-auto h-full w-full">
          <Scene3D />
        </div>
      </div>

      {/* ── Foreground Mission Command Center ── */}
      <div className="relative z-10 space-y-6">
        {/* 1. Hero Command Header */}
        <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[#0d1627]/75 p-7 shadow-2xl backdrop-blur-xl">
          <div className="relative z-10 max-w-3xl space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 backdrop-blur-md">
              <Radio className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
              SIH26057 · Autonomous Maritime Threat Identification &amp; PostGIS Geotagging
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              MARIS Isolating <br className="hidden sm:inline" />
              <AnimatedText
                words={[
                  'Ghost Nets',
                  'Wreck Debris',
                  'UXO Munitions',
                  'Subsea Pipelines',
                  'Historic Shipwrecks',
                ]}
              />
            </h1>

            <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
              Edge AI sonar ingestion with UNDROIP attitude compensation, 2D-FFT noise filtering,
              and YOLOv8-DySample 5-channel GLCM texture detection across Indian maritime economic zones.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/map"
                className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-xs font-bold text-black shadow-lg shadow-cyan-500/25 transition-all hover:bg-cyan-300 hover:scale-[1.02]"
              >
                <MapIcon className="h-4 w-4" />
                Launch PostGIS Swath Map
                <ArrowUpRight className="h-4 w-4" />
              </Link>

              <Link
                href="/upload"
                className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[#0f172a]/80 px-5 py-2.5 text-xs font-bold text-white backdrop-blur-md transition-all hover:border-cyan-400 hover:bg-[#1e293b]"
              >
                <FileUp className="h-4 w-4 text-cyan-400" />
                Ingest Sonar Telemetry (XTF / JSF)
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Global Unified Filter Bar */}
        <GlobalFilterBar />

        {/* 3. Primary KPI Metrics Grid (6 Interactive Cards with Sparklines) */}
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {/* KPI 1: Surveys Processed */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[#0d1627]/80 p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-slate-400 uppercase">Surveys Processed</span>
              <Activity className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="mt-2 font-mono text-2xl font-black text-white">{kpi.totalSurveys}</p>
            <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
              <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
                <TrendingUp className="h-3 w-3" /> +{kpi.surveysDelta7d}%
              </span>
              <span className="text-slate-400">vs last 7d</span>
            </div>
          </div>

          {/* KPI 2: Total Anomalies */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[#0d1627]/80 p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-slate-400 uppercase">Detections Isolated</span>
              <Anchor className="h-4 w-4 text-sky-400" />
            </div>
            <p className="mt-2 font-mono text-2xl font-black text-sky-400">{anomalies.length}</p>
            <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
              <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
                <TrendingUp className="h-3 w-3" /> +{kpi.anomaliesDelta7d}%
              </span>
              <span className="text-slate-400">{totalUnfiltered} cataloged</span>
            </div>
          </div>

          {/* KPI 3: Ghost Nets */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[#0d1627]/80 p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-slate-400 uppercase">Ghost Nets</span>
              <ShieldAlert className="h-4 w-4 text-rose-400" />
            </div>
            <p className="mt-2 font-mono text-2xl font-black text-rose-400">
              {anomalies.filter((a) => a.hazardClass === 'ghost_net').length}
            </p>
            <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
              <span className="flex items-center gap-0.5 text-rose-300 font-bold">
                <TrendingDown className="h-3 w-3" /> -12% threat
              </span>
              <span className="text-slate-400">Active Recovery</span>
            </div>
          </div>

          {/* KPI 4: Active Pipeline Workers */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[#0d1627]/80 p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-slate-400 uppercase">Active Workers</span>
              <Cpu className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-2 font-mono text-2xl font-black text-emerald-400">{kpi.activeWorkers}</p>
            <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
              <span className="text-emerald-300 font-bold">{jobs.length} Active Jobs</span>
              <span className="text-slate-400">RTX 4050 FP16</span>
            </div>
          </div>

          {/* KPI 5: Avg YOLO Confidence */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[#0d1627]/80 p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-slate-400 uppercase">Mean Confidence</span>
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
            <p className="mt-2 font-mono text-2xl font-black text-amber-300">
              {(kpi.avgConfidence * 100).toFixed(1)}%
            </p>
            <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
              <span className="text-amber-300 font-bold">mAP50: 94.2%</span>
              <span className="text-slate-400">DySample FPN</span>
            </div>
          </div>

          {/* KPI 6: Total Seabed Coverage */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[#0d1627]/80 p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-slate-400 uppercase">Seabed Mapped</span>
              <Layers className="h-4 w-4 text-purple-400" />
            </div>
            <p className="mt-2 font-mono text-2xl font-black text-purple-300">{kpi.totalAreaCoveredKm2}</p>
            <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
              <span className="text-purple-300 font-bold">km² Swath Area</span>
              <span className="text-slate-400">200m Swath</span>
            </div>
          </div>
        </div>

        {/* 4. Analytics Section: Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Donut Chart: Hazard Taxonomy Distribution */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[#0d1627]/85 p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Hazard Taxonomy Breakdown
              </h3>
              <span className="font-mono text-[10px] text-cyan-400">{anomalies.length} Targets</span>
            </div>

            <div className="mt-3 flex flex-col items-center">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taxonomyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={76}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {taxonomyData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} stroke="#0d1627" strokeWidth={2} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0a1120',
                        borderColor: '#182844',
                        borderRadius: '0.5rem',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Taxonomy Legend Grid */}
              <div className="mt-2 grid w-full grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                {taxonomyData.map((t) => (
                  <div key={t.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-300 truncate">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: t.color }}></span>
                      <span className="truncate">{t.name}</span>
                    </span>
                    <span className="font-mono font-bold text-white ml-2">{t.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Area Chart: Detections Over Time */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[#0d1627]/85 p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Acoustic Detections Velocity
              </h3>
              <div className="flex rounded-lg border border-[var(--color-border)] bg-[#060a12] p-0.5 text-[10px] font-mono">
                {(['24h', '7d', '30d'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeSeriesRange(r)}
                    className={clsx(
                      'rounded px-2 py-0.5 uppercase transition-colors',
                      timeSeriesRange === r ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData}>
                  <defs>
                    <linearGradient id="colorDet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorGhost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff3b5c" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ff3b5c" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#4d5e78" fontSize={10} fontFamily="monospace" />
                  <YAxis stroke="#4d5e78" fontSize={10} fontFamily="monospace" />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#0a1120',
                      borderColor: '#182844',
                      borderRadius: '0.5rem',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Area type="monotone" dataKey="detections" stroke="#00f0ff" strokeWidth={2} fillOpacity={1} fill="url(#colorDet)" />
                  <Area type="monotone" dataKey="ghostNets" stroke="#ff3b5c" strokeWidth={2} fillOpacity={1} fill="url(#colorGhost)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Confidence Histogram */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[#0d1627]/85 p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                YOLOv8 Confidence Spectrum
              </h3>
              <span className="font-mono text-[10px] text-amber-400">Mean: {(kpi.avgConfidence * 100).toFixed(0)}%</span>
            </div>

            <div className="mt-3 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confidenceBins}>
                  <XAxis dataKey="bin" stroke="#4d5e78" fontSize={9} fontFamily="monospace" />
                  <YAxis stroke="#4d5e78" fontSize={10} fontFamily="monospace" />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#0a1120',
                      borderColor: '#182844',
                      borderRadius: '0.5rem',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 5. Live Detections Stream Table & Processing Pipeline Queue */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left 2 Cols: Live Telemetry Stream Table */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[#0d1627]/90 shadow-2xl backdrop-blur-xl lg:col-span-2">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
                <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Live Sonar Anomaly Telemetry Stream
                </h2>
              </div>
              <Link href="/anomalies" className="flex items-center gap-1 font-mono text-xs text-cyan-400 hover:underline">
                View Full Target Inventory ({anomalies.length}) <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-border)] font-mono text-[10px] text-slate-400 uppercase">
                    <th className="pb-2.5">Hazard Classification</th>
                    <th className="pb-2.5">Zone &amp; Survey</th>
                    <th className="pb-2.5">Coordinates (WGS84)</th>
                    <th className="pb-2.5">Confidence</th>
                    <th className="pb-2.5">Severity</th>
                    <th className="pb-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {anomalies.slice(0, 8).map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedAnomaly(item)}
                      className="cursor-pointer transition-colors hover:bg-cyan-500/5 group"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <HazardBadge hazardClass={item.hazardClass} size="sm" />
                          <span className="font-bold text-white truncate max-w-[160px]">{item.label}</span>
                        </div>
                      </td>
                      <td className="py-3 font-mono text-[11px] text-slate-300">
                        {item.zone}
                      </td>
                      <td className="py-3 font-mono text-[11px] text-slate-400">
                        {item.latitude.toFixed(4)}°N, {item.longitude.toFixed(4)}°E (D: {item.depthM}m)
                      </td>
                      <td className="py-3 font-mono text-emerald-400 font-bold">
                        {(item.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="py-3">
                        <SeverityPill severity={item.severity} />
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setSelectedAnomaly(item)}
                          className="rounded bg-[#121d33] border border-[var(--color-border)] px-2 py-1 text-[10px] font-bold text-cyan-300 group-hover:border-cyan-400 group-hover:bg-cyan-500/20"
                        >                          Inspect →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Col: Active Ingestion & Processing Pipeline Jobs */}
          <div className="space-y-4">
            {/* Active Pipeline Jobs */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[#0d1627]/90 p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />
                  <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    Pipeline Execution Queue
                  </h3>
                </div>
                <Link href="/upload" className="font-mono text-[10px] text-cyan-400 hover:underline">
                  New Survey +
                </Link>
              </div>

              <div className="mt-3 space-y-3">
                {jobs.map((job) => (
                  <div key={job.id} className="rounded-lg border border-[var(--color-border)] bg-[#070b14] p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-white truncate max-w-[170px]">{job.surveyName}</span>
                      <span className="font-mono text-[10px] uppercase text-cyan-400 font-bold">{job.stage}</span>
                    </div>

                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Vessel: {job.vessel}</span>
                      <span>{job.progress}%</span>
                    </div>

                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#0d1627]">
                      <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${job.progress}%` }} />
                    </div>

                    <p className="font-mono text-[10px] text-slate-400 truncate">
                      {job.logs[job.logs.length - 1]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tactical Critical Alerts Panel */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[#0d1627]/90 p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400 animate-pulse" />
                  <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    Tactical Action Alerts
                  </h3>
                </div>
                <span className="rounded bg-rose-500/20 px-2 py-0.5 font-mono text-[10px] text-rose-300">
                  {alerts.filter((a) => !a.acknowledged).length} Active
                </span>
              </div>

              <div className="mt-3 space-y-2.5">
                {alerts.map((alt) => (
                  <div
                    key={alt.id}
                    className={clsx(
                      'rounded-lg border p-3 text-xs',
                      alt.acknowledged
                        ? 'border-slate-800 bg-[#070b14] text-slate-400'
                        : 'border-rose-500/40 bg-rose-950/20 text-rose-200'
                    )}
                  >
                    <p className="font-bold text-white">{alt.title}</p>
                    <p className="mt-1 text-[11px] text-slate-300 leading-snug">{alt.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span suppressHydrationWarning className="font-mono text-[10px] text-slate-400">
                        {new Date(alt.timestamp).toLocaleTimeString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-cyan-400">{alt.actionRequired}</span>
                        {!alt.acknowledged && (
                          <button
                            onClick={() => demoStore.acknowledgeAlert(alt.id)}
                            className="rounded bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-[10px] font-bold text-rose-300 hover:bg-rose-500/30"
                          >
                            Acknowledge
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-out Anomaly Detail Drawer */}
      <DetailDrawer anomaly={selectedAnomaly} onClose={() => setSelectedAnomaly(null)} />
    </div>
  );
}
