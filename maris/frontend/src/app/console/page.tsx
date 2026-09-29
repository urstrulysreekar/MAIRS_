'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
      unknown: 0,
    };

    anomalies.forEach((a) => {
      if (counts[a.hazardClass] !== undefined) {
        counts[a.hazardClass]++;
      }
    });

    const colors: Record<HazardClass, string> = {
      ghost_net: '#d93829',
      wreck_debris: '#3b7b99',
      uxo: '#d93829',
      pipeline: '#8c978f',
      biological: '#5b937c',
      geological: '#4d5750',
      unknown: '#8c978f',
    };

    const labels: Record<HazardClass, string> = {
      ghost_net: 'Ghost Nets',
      wreck_debris: 'Wreck Debris',
      uxo: 'UXO / Munitions',
      pipeline: 'Pipelines / Cables',
      biological: 'Coral Reefs',
      geological: 'Geological Bed',
      unknown: 'Unknown Class',
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
      if (a.confidence == null) return;
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
    <div className="relative min-h-screen space-y-6 pb-16 bg-[#070a0f]">
      {/* ── Foreground Mission Command Center ── */}
      <div className="relative z-10 space-y-6">
        {/* 1. Hero Command Header */}
        <div className="relative overflow-hidden rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] p-7">
          <div className="relative z-10 max-w-3xl space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#101622] px-3.5 py-1 text-xs font-semibold text-[#8c978f]">
              <span className="text-[#3b7b99]">●</span>
              SIH26057 · Autonomous Maritime Threat Identification &amp; PostGIS Geotagging
            </div>

            <h1 className="text-3xl font-black tracking-tight text-[#e2e8e4] sm:text-4xl lg:text-5xl">
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

            <p className="text-xs sm:text-sm leading-relaxed text-[#8c978f]">
              Edge AI sonar ingestion with UNDROIP attitude compensation, 2D-FFT noise filtering,
              and YOLOv8-DySample 5-channel GLCM texture detection across Indian maritime economic zones.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/map"
                className="flex items-center gap-2 rounded-sm bg-[#161e2e] border border-[rgba(226,232,228,0.18)] px-5 py-2.5 text-xs font-bold text-[#e2e8e4] transition-all hover:bg-[#101622]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx={12} cy={9} r={2.5}/></svg>
                Launch PostGIS Swath Map
                <span>↗</span>
              </Link>

              <Link
                href="/upload"
                className="flex items-center gap-2 rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] px-5 py-2.5 text-xs font-bold text-[#e2e8e4] transition-all hover:bg-[#101622]"
              >
                <span>↑</span>
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
          <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-[#8c978f] uppercase">Surveys Processed</span>
              <span className="text-[#3b7b99]">●</span>
            </div>
            <p className="mt-2 font-mono text-2xl font-black text-[#e2e8e4]">{kpi.totalSurveys}</p>
            <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
              <span className="flex items-center gap-0.5 text-[#5b937c] font-bold">
                <span>↑</span> +{kpi.surveysDelta7d}%
              </span>
              <span className="text-[#4d5750]">vs last 7d</span>
            </div>
          </div>

          {/* KPI 2: Total Anomalies */}
          <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-[#8c978f] uppercase">Detections Isolated</span>
              <svg className="h-4 w-4 text-[#3b7b99]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <circle cx="12" cy="5" r="2.5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5V20m-7-5c0 3.866 3.134 7 7 7s7-3.134 7-7M5 15H3m18 0h-2" />
              </svg>
            </div>
            <p className="mt-2 font-mono text-2xl font-black text-[#3b7b99]">{anomalies.length}</p>
            <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
              <span className="flex items-center gap-0.5 text-[#5b937c] font-bold">
                <span>↑</span> +{kpi.anomaliesDelta7d}%
              </span>
              <span className="text-[#4d5750]">{totalUnfiltered} cataloged</span>
            </div>
          </div>

          {/* KPI 3: Ghost Nets */}
          <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-[#8c978f] uppercase">Ghost Nets</span>
              <svg className="h-4 w-4 text-[#d93829]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.007v.008H12v-.008zM12 3c7.2 0 9 1.8 9 9 0 7.2-6 9.6-9 10.8C9 21.6 3 19.2 3 12c0-7.2 1.8-9 9-9z" />
              </svg>
            </div>
            <p className="mt-2 font-mono text-2xl font-black text-[#d93829]">
              {anomalies.filter((a) => a.hazardClass === 'ghost_net').length}
            </p>
            <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
              <span className="flex items-center gap-0.5 text-[#d93829] font-bold">
                <span>↓</span> -12% threat
              </span>
              <span className="text-[#4d5750]">Active Recovery</span>
            </div>
          </div>

          {/* KPI 4: Active Pipeline Workers */}
          <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-[#8c978f] uppercase">Active Workers</span>
              <span className="text-[#5b937c]">▣</span>
            </div>
            <p className="mt-2 font-mono text-2xl font-black text-[#5b937c]">{kpi.activeWorkers}</p>
            <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#5b937c] font-bold">{jobs.length} Active Jobs</span>
              <span className="text-[#4d5750]">RTX 4050 FP16</span>
            </div>
          </div>

          {/* KPI 5: Avg YOLO Confidence */}
          <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-[#8c978f] uppercase">Mean Confidence</span>
              <span className="text-[#d99b26]">◆</span>
            </div>
            <p className="mt-2 font-mono text-2xl font-black text-[#d99b26]">
              {(kpi.avgConfidence * 100).toFixed(1)}%
            </p>
            <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#d99b26] font-bold">mAP50: 94.2%</span>
              <span className="text-[#4d5750]">DySample FPN</span>
            </div>
          </div>

          {/* KPI 6: Total Seabed Coverage */}
          <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-[#8c978f] uppercase">Seabed Mapped</span>
              <svg className="h-4 w-4 text-[#8c978f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
            </div>
            <p className="mt-2 font-mono text-2xl font-black text-[#8c978f]">{kpi.totalAreaCoveredKm2}</p>
            <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#8c978f] font-bold">km² Swath Area</span>
              <span className="text-[#4d5750]">200m Swath</span>
            </div>
          </div>
        </div>

        {/* 4. Analytics Section: Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Donut Chart: Hazard Taxonomy Distribution */}
          <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] p-5">
            <div className="flex items-center justify-between border-b border-[rgba(226,232,228,0.08)] pb-3">
              <h3 className="font-mono text-xs font-bold text-[#e2e8e4] uppercase tracking-wider">
                Hazard Taxonomy Breakdown
              </h3>
              <span className="font-mono text-[10px] text-[#3b7b99]">{anomalies.length} Targets</span>
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
                        <Cell key={entry.name} fill={entry.color} stroke="#0b1018" strokeWidth={2} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#101622',
                        borderColor: 'rgba(226,232,228,0.08)',
                        borderRadius: '2px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        color: '#e2e8e4'
                      }}
                      itemStyle={{ color: '#e2e8e4' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Taxonomy Legend Grid */}
              <div className="mt-2 grid w-full grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                {taxonomyData.map((t) => (
                  <div key={t.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#8c978f] truncate">
                      <span className="h-2 w-2 rounded-sm shrink-0" style={{ backgroundColor: t.color }}></span>
                      <span className="truncate">{t.name}</span>
                    </span>
                    <span className="font-mono font-bold text-[#e2e8e4] ml-2">{t.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Area Chart: Detections Over Time */}
          <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] p-5">
            <div className="flex items-center justify-between border-b border-[rgba(226,232,228,0.08)] pb-3">
              <h3 className="font-mono text-xs font-bold text-[#e2e8e4] uppercase tracking-wider">
                Acoustic Detections Velocity
              </h3>
              <div className="flex rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#101622] p-0.5 text-[10px] font-mono">
                {(['24h', '7d', '30d'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeSeriesRange(r)}
                    className={clsx(
                      'rounded-sm px-2 py-0.5 uppercase transition-colors',
                      timeSeriesRange === r ? 'bg-[#161e2e] text-[#e2e8e4] font-bold' : 'text-[#8c978f]'
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
                      <stop offset="5%" stopColor="#3b7b99" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b7b99" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorGhost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d93829" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#d93829" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#4d5750" fontSize={10} fontFamily="monospace" />
                  <YAxis stroke="#4d5750" fontSize={10} fontFamily="monospace" />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#101622',
                      borderColor: 'rgba(226,232,228,0.08)',
                      borderRadius: '2px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      color: '#e2e8e4'
                    }}
                    itemStyle={{ color: '#e2e8e4' }}
                  />
                  <Area type="monotone" dataKey="detections" stroke="#3b7b99" strokeWidth={2} fillOpacity={1} fill="url(#colorDet)" />
                  <Area type="monotone" dataKey="ghostNets" stroke="#d93829" strokeWidth={2} fillOpacity={1} fill="url(#colorGhost)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Confidence Histogram */}
          <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] p-5">
            <div className="flex items-center justify-between border-b border-[rgba(226,232,228,0.08)] pb-3">
              <h3 className="font-mono text-xs font-bold text-[#e2e8e4] uppercase tracking-wider">
                YOLOv8 Confidence Spectrum
              </h3>
              <span className="font-mono text-[10px] text-[#d99b26]">Mean: {(kpi.avgConfidence * 100).toFixed(0)}%</span>
            </div>

            <div className="mt-3 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confidenceBins}>
                  <XAxis dataKey="bin" stroke="#4d5750" fontSize={9} fontFamily="monospace" />
                  <YAxis stroke="#4d5750" fontSize={10} fontFamily="monospace" />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#101622',
                      borderColor: 'rgba(226,232,228,0.08)',
                      borderRadius: '2px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      color: '#e2e8e4'
                    }}
                    itemStyle={{ color: '#e2e8e4' }}
                  />
                  <Bar dataKey="count" fill="#3b7b99" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 5. Live Detections Stream Table & Processing Pipeline Queue */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left 2 Cols: Live Telemetry Stream Table */}
          <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] lg:col-span-2">
            <div className="flex items-center justify-between border-b border-[rgba(226,232,228,0.08)] px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="text-[#3b7b99]">●</span>
                <h2 className="font-mono text-xs font-bold text-[#e2e8e4] uppercase tracking-wider">
                  Live Sonar Anomaly Telemetry Stream
                </h2>
              </div>
              <Link href="/anomalies" className="flex items-center gap-1 font-mono text-xs text-[#3b7b99] hover:underline">
                View Full Target Inventory ({anomalies.length}) <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="m9 18 6-6-6-6"/></svg>
              </Link>
            </div>

            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[rgba(226,232,228,0.08)] font-mono text-[10px] text-[#8c978f] uppercase">
                    <th className="pb-2.5">Hazard Classification</th>
                    <th className="pb-2.5">Zone &amp; Survey</th>
                    <th className="pb-2.5">Coordinates (WGS84)</th>
                    <th className="pb-2.5">Confidence</th>
                    <th className="pb-2.5">Severity</th>
                    <th className="pb-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(226,232,228,0.08)]">
                  {anomalies.slice(0, 8).map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedAnomaly(item)}
                      className="cursor-pointer transition-colors hover:bg-[#101622] group"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <HazardBadge hazardClass={item.hazardClass} size="sm" />
                          <span className="font-bold text-[#e2e8e4] truncate max-w-[160px]">{item.label}</span>
                        </div>
                      </td>
                      <td className="py-3 font-mono text-[11px] text-[#8c978f]">
                        {item.zone}
                      </td>
                      <td className="py-3 font-mono text-[11px] text-[#4d5750]">
                        {item.latitude == null || item.longitude == null
                          ? 'Not geotagged'
                          : `${item.latitude.toFixed(4)}°N, ${item.longitude.toFixed(4)}°E`}
                        {item.depthM == null ? '' : ` (D: ${item.depthM}m)`}
                      </td>
                      <td className="py-3 font-mono text-[#5b937c] font-bold">
                        {item.confidence == null ? 'Not recorded' : `${(item.confidence * 100).toFixed(1)}%`}
                      </td>
                      <td className="py-3">
                        <SeverityPill severity={item.severity} />
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setSelectedAnomaly(item)}
                          className="rounded-sm bg-[#161e2e] border border-[rgba(226,232,228,0.08)] px-2 py-1 text-[10px] font-bold text-[#e2e8e4] group-hover:border-[rgba(226,232,228,0.18)]"
                        >
                          Inspect →
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
            <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] p-5">
              <div className="flex items-center justify-between border-b border-[rgba(226,232,228,0.08)] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[#3b7b99]">●</span>
                  <h3 className="font-mono text-xs font-bold text-[#e2e8e4] uppercase tracking-wider">
                    Pipeline Execution Queue
                  </h3>
                </div>
                <Link href="/upload" className="font-mono text-[10px] text-[#3b7b99] hover:underline">
                  New Survey +
                </Link>
              </div>

              <div className="mt-3 space-y-3">
                {jobs.map((job) => (
                  <div key={job.id} className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#101622] p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#e2e8e4] truncate max-w-[170px]">{job.surveyName}</span>
                      <span className="font-mono text-[10px] uppercase text-[#3b7b99] font-bold">{job.stage}</span>
                    </div>

                    <div className="flex justify-between text-[10px] font-mono text-[#8c978f]">
                      <span>Vessel: {job.vessel}</span>
                      <span>{job.progress}%</span>
                    </div>

                    <div className="h-1.5 w-full overflow-hidden rounded-sm bg-[#070a0f]">
                      <div className="h-full bg-[#3b7b99] transition-all duration-300" style={{ width: `${job.progress}%` }} />
                    </div>

                    <p className="font-mono text-[10px] text-[#4d5750] truncate">
                      {job.logs[job.logs.length - 1]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tactical Critical Alerts Panel */}
            <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] p-5">
              <div className="flex items-center justify-between border-b border-[rgba(226,232,228,0.08)] pb-3">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-[#d93829]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 6.375a1.5 1.5 0 0 0 1.299 2.25h16.008a1.5 1.5 0 0 0 1.3-2.25L13.3 3.375a1.5 1.5 0 0 0-2.6 0L2.697 19.125zM12 18h.008v.008H12V18z" />
                  </svg>
                  <h3 className="font-mono text-xs font-bold text-[#e2e8e4] uppercase tracking-wider">
                    Tactical Action Alerts
                  </h3>
                </div>
                <span className="rounded-sm bg-[#161e2e] px-2 py-0.5 font-mono text-[10px] text-[#d93829]">
                  {alerts.filter((a) => !a.acknowledged).length} Active
                </span>
              </div>

              <div className="mt-3 space-y-2.5">
                {alerts.map((alt) => (
                  <div
                    key={alt.id}
                    className={clsx(
                      'rounded-sm border p-3 text-xs',
                      alt.acknowledged
                        ? 'border-[rgba(226,232,228,0.08)] bg-[#101622] text-[#8c978f]'
                        : 'border-[#d93829]/40 bg-[#d93829]/10 text-[#e2e8e4]'
                    )}
                  >
                    <p className="font-bold text-[#e2e8e4]">{alt.title}</p>
                    <p className="mt-1 text-[11px] text-[#8c978f] leading-snug">{alt.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span suppressHydrationWarning className="font-mono text-[10px] text-[#4d5750]">
                        {new Date(alt.timestamp).toLocaleTimeString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-[#3b7b99]">{alt.actionRequired}</span>
                        {!alt.acknowledged && (
                          <button
                            onClick={() => demoStore.acknowledgeAlert(alt.id)}
                            className="rounded-sm bg-[#161e2e] border border-[rgba(226,232,228,0.08)] px-2 py-0.5 text-[10px] font-bold text-[#d93829] hover:bg-[#101622]"
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
