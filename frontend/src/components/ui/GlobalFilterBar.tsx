'use client';

import React from 'react';
import { useFilteredAnomalies, MARIS_SURVEY_ZONES } from '@/lib/demo';
import { Filter, Search, RotateCcw, SlidersHorizontal, Layers, ShieldAlert, Sparkles } from 'lucide-react';
import clsx from 'clsx';

export default function GlobalFilterBar({ className = '' }: { className?: string }) {
  const { filters, setFilters, resetFilters, anomalies, totalUnfiltered } = useFilteredAnomalies();
  const zoneKeys = Object.keys(MARIS_SURVEY_ZONES);

  return (
    <div className={`rounded-xl border border-[var(--color-border)] bg-[#0a1120]/90 p-3.5 shadow-xl backdrop-blur-md ${className}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Search input */}
        <div className="relative flex-1">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Filter by label, anomaly ID, survey, or zone..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[#060a12] py-2 pr-3 pl-9 text-xs text-white placeholder-[var(--color-text-muted)] focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* Center: Dropdown selects */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Maritime Zone */}
          <select
            value={filters.selectedZone}
            onChange={(e) => setFilters({ selectedZone: e.target.value })}
            className="rounded-lg border border-[var(--color-border)] bg-[#060a12] px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
          >
            <option value="all">All Zones ({zoneKeys.length})</option>
            {zoneKeys.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>

          {/* Hazard Class */}
          <select
            value={filters.selectedClass}
            onChange={(e) => setFilters({ selectedClass: e.target.value })}
            className="rounded-lg border border-[var(--color-border)] bg-[#060a12] px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
          >
            <option value="all">All Hazard Classes</option>
            <option value="ghost_net">Ghost Nets (Critical)</option>
            <option value="wreck_debris">Wreck Debris</option>
            <option value="uxo">UXO / Munitions</option>
            <option value="pipeline">Pipelines / Cables</option>
            <option value="biological">Biological Reefs</option>
            <option value="geological">Geological Formations</option>
          </select>

          {/* Severity */}
          <select
            value={filters.selectedSeverity}
            onChange={(e) => setFilters({ selectedSeverity: e.target.value })}
            className="rounded-lg border border-[var(--color-border)] bg-[#060a12] px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Min Confidence Slider */}
          <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[#060a12] px-3 py-1 text-xs">
            <span className="font-mono text-[11px] text-slate-400">Conf:</span>
            <input
              type="range"
              min={0}
              max={0.95}
              step={0.05}
              value={filters.minConfidence}
              onChange={(e) => setFilters({ minConfidence: Number(e.target.value) })}
              className="h-1.5 w-16 accent-cyan-400 cursor-pointer"
            />
            <span className="font-mono text-[11px] font-bold text-cyan-400">
              {Math.round(filters.minConfidence * 100)}%+
            </span>
          </div>

          {/* Time Range Toggle */}
          <div className="flex rounded-lg border border-[var(--color-border)] bg-[#060a12] p-0.5 text-[11px] font-mono">
            {(['all', '24h', '7d', '30d'] as const).map((tr) => (
              <button
                key={tr}
                onClick={() => setFilters({ timeRange: tr })}
                className={clsx(
                  'rounded px-2 py-1 uppercase transition-colors',
                  filters.timeRange === tr
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {tr}
              </button>
            ))}
          </div>

          {/* Reset Filters button */}
          <button
            onClick={resetFilters}
            title="Reset Filters"
            className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[#060a12] px-2.5 py-1.5 text-xs text-slate-400 hover:bg-[#121d33] hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Filter summary status strip */}
      <div className="mt-2.5 flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-2 text-[11px] font-mono text-[var(--color-text-muted)]">
        <span suppressHydrationWarning>
          Showing <strong className="text-white" suppressHydrationWarning>{anomalies.length}</strong> of{' '}
          <strong className="text-slate-300" suppressHydrationWarning>{totalUnfiltered}</strong> verified acoustic detections
        </span>
        <span className="flex items-center gap-1 text-cyan-400">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping"></span>
          REALTIME FILTERS SYNCHRONIZED
        </span>
      </div>
    </div>
  );
}
