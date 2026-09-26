'use client';

import React from 'react';
import { useFilteredAnomalies, MARIS_SURVEY_ZONES } from '@/lib/demo';
import clsx from 'clsx';

export default function GlobalFilterBar({ className = '' }: { className?: string }) {
  const { filters, setFilters, resetFilters, anomalies, totalUnfiltered } = useFilteredAnomalies();
  const zoneKeys = Object.keys(MARIS_SURVEY_ZONES);

  return (
    <div className={`rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] p-3.5 ${className}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Search input */}
        <div className="relative flex-1">
          <svg className="absolute top-2.5 left-3 h-4 w-4 text-[#4d5750]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx={10} cy={10} r={7}/><path d="m21 21-5.2-5.2"/></svg>
          <input
            type="text"
            placeholder="Filter by label, anomaly ID, survey, or zone..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
            className="w-full rounded border border-[rgba(226,232,228,0.08)] bg-[#070a0f] py-2 pr-3 pl-9 text-xs text-[#e2e8e4] placeholder-[#4d5750] focus:border-[rgba(226,232,228,0.18)] focus:outline-none"
          />
        </div>

        {/* Center: Dropdown selects */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Maritime Zone */}
          <select
            value={filters.selectedZone}
            onChange={(e) => setFilters({ selectedZone: e.target.value })}
            className="rounded border border-[rgba(226,232,228,0.08)] bg-[#070a0f] px-2.5 py-1.5 text-xs text-[#8c978f] focus:border-[rgba(226,232,228,0.18)] focus:outline-none"
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
            className="rounded border border-[rgba(226,232,228,0.08)] bg-[#070a0f] px-2.5 py-1.5 text-xs text-[#8c978f] focus:border-[rgba(226,232,228,0.18)] focus:outline-none"
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
            className="rounded border border-[rgba(226,232,228,0.08)] bg-[#070a0f] px-2.5 py-1.5 text-xs text-[#8c978f] focus:border-[rgba(226,232,228,0.18)] focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Min Confidence Slider */}
          <div className="flex items-center gap-2 rounded border border-[rgba(226,232,228,0.08)] bg-[#070a0f] px-3 py-1 text-xs">
            <span className="font-mono text-[11px] text-[#4d5750]">Conf:</span>
            <input
              type="range"
              min={0}
              max={0.95}
              step={0.05}
              value={filters.minConfidence}
              onChange={(e) => setFilters({ minConfidence: Number(e.target.value) })}
              className="h-1.5 w-16 accent-[#3b7b99] cursor-pointer"
            />
            <span className="font-mono text-[11px] font-bold text-[#3b7b99]">
              {Math.round(filters.minConfidence * 100)}%+
            </span>
          </div>

          {/* Time Range Toggle */}
          <div className="flex rounded border border-[rgba(226,232,228,0.08)] bg-[#070a0f] p-0.5 text-[11px] font-mono">
            {(['all', '24h', '7d', '30d'] as const).map((tr) => (
              <button
                key={tr}
                onClick={() => setFilters({ timeRange: tr })}
                className={clsx(
                  'rounded px-2 py-1 uppercase transition-colors',
                  filters.timeRange === tr
                    ? 'bg-[#161e2e] text-[#e2e8e4] font-bold'
                    : 'text-[#8c978f] hover:text-[#e2e8e4]'
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
            className="flex items-center gap-1 rounded border border-[rgba(226,232,228,0.08)] bg-[#070a0f] px-2.5 py-1.5 text-xs text-[#8c978f] hover:bg-[#161e2e] hover:text-[#e2e8e4]"
          >
            <span className="text-[14px]">↺</span>
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Filter summary status strip */}
      <div className="mt-2.5 flex items-center justify-between border-t border-[rgba(226,232,228,0.08)] pt-2 text-[11px] font-mono text-[#8c978f]">
        <span suppressHydrationWarning>
          Showing <strong className="text-[#e2e8e4]" suppressHydrationWarning>{anomalies.length}</strong> of{' '}
          <strong className="text-[#8c978f]" suppressHydrationWarning>{totalUnfiltered}</strong> verified acoustic detections
        </span>
        <span className="flex items-center gap-1 text-[#5b937c]">
          <span>●</span>
          REALTIME FILTERS SYNCHRONIZED
        </span>
      </div>
    </div>
  );
}
