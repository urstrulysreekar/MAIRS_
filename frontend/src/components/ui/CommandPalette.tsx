'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useDemoStore, demoStore } from '@/lib/demo';
import { HazardBadge } from './Badge';
import {
  Search,
  Command,
  Compass,
  FileUp,
  Map as MapIcon,
  Shield,
  Layers,
  ArrowRight,
  X,
  FileText,
  Filter,
  RotateCcw,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const { anomalies, surveys } = useDemoStore();
  const router = useRouter();

  // Handle keyboard shortcut Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle handled by caller
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const quickFilterCommands = useMemo(() => {
    const list = [
      { id: 'f-crit', label: 'Filter Telemetry: Critical Severity Only', desc: 'Isolate immediate active threats', action: () => demoStore.setFilters({ selectedSeverity: 'critical' }) },
      { id: 'f-ghost', label: 'Filter Telemetry: Ghost Nets Only', desc: 'Isolate abandoned fishing nets', action: () => demoStore.setFilters({ selectedClass: 'ghost_net' }) },
      { id: 'f-uxo', label: 'Filter Telemetry: UXO / Munitions Only', desc: 'Isolate unexploded ordnance', action: () => demoStore.setFilters({ selectedClass: 'uxo' }) },
      { id: 'f-conf', label: 'Filter Telemetry: High Confidence (80%+)', desc: 'Set minimum confidence threshold', action: () => demoStore.setFilters({ minConfidence: 0.8 }) },
      { id: 'f-reset', label: 'Reset All Telemetry Filters', desc: 'Clear active search, class, and severity filters', action: () => demoStore.resetFilters() },
    ];
    if (!query.trim()) return list.slice(0, 3);
    const q = query.toLowerCase();
    return list.filter((item) => item.label.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || 'filter'.includes(q) || 'reset'.includes(q));
  }, [query]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return { anomalies: anomalies.slice(0, 5), surveys: surveys.slice(0, 3) };

    const q = query.toLowerCase();
    const matchedAnomalies = anomalies
      .filter((a) => a.label.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.zone.toLowerCase().includes(q))
      .slice(0, 6);

    const matchedSurveys = surveys
      .filter((s) => s.name.toLowerCase().includes(q) || s.zone.toLowerCase().includes(q) || s.vessel.toLowerCase().includes(q))
      .slice(0, 4);

    return { anomalies: matchedAnomalies, surveys: matchedSurveys };
  }, [query, anomalies, surveys]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 backdrop-blur-md">
      <div className="flex-1 absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-2xl border border-[var(--color-border)] bg-[#0a1120] p-4 shadow-2xl overflow-hidden">
        {/* Search Bar Input */}
        <div className="relative flex items-center border-b border-[var(--color-border)] pb-3">
          <Search className="h-5 w-5 text-cyan-400 mr-2.5" />
          <input
            type="text"
            placeholder="Search anomalies, survey files, maritime zones, or commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-[#121d33] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Navigation Pages */}
        {!query && (
          <div className="mt-3 border-b border-[var(--color-border-subtle)] pb-3">
            <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Navigation</span>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs font-semibold">
              <button
                onClick={() => {
                  router.push('/console');
                  onClose();
                }}
                className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[#0d1627] p-2 text-slate-200 hover:border-cyan-400 hover:text-white"
              >
                <Shield className="h-4 w-4 text-cyan-400" /> Operations
              </button>
              <button
                onClick={() => {
                  router.push('/map');
                  onClose();
                }}
                className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[#0d1627] p-2 text-slate-200 hover:border-cyan-400 hover:text-white"
              >
                <MapIcon className="h-4 w-4 text-cyan-400" /> PostGIS Map
              </button>
              <button
                onClick={() => {
                  router.push('/upload');
                  onClose();
                }}
                className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[#0d1627] p-2 text-slate-200 hover:border-cyan-400 hover:text-white"
              >
                <FileUp className="h-4 w-4 text-cyan-400" /> Ingestion
              </button>
              <button
                onClick={() => {
                  router.push('/anomalies');
                  onClose();
                }}
                className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[#0d1627] p-2 text-slate-200 hover:border-cyan-400 hover:text-white"
              >
                <Layers className="h-4 w-4 text-cyan-400" /> Target Inventory
              </button>
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="mt-3 max-h-80 overflow-y-auto space-y-3">
          {/* Quick Filter Commands */}
          {quickFilterCommands.length > 0 && (
            <div>
              <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Telemetry Filter Commands ({quickFilterCommands.length})
              </span>
              <div className="mt-1 space-y-1">
                {quickFilterCommands.map((fc) => (
                  <div
                    key={fc.id}
                    onClick={() => {
                      fc.action();
                      onClose();
                    }}
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-transparent p-2 hover:border-cyan-500/40 hover:bg-[#0d1627]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                        <Filter className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{fc.label}</p>
                        <p className="font-mono text-[10px] text-slate-400">{fc.desc}</p>
                      </div>
                    </div>
                    <span className="rounded bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] text-cyan-400 font-bold">
                      APPLY
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Anomalies */}
          {searchResults.anomalies.length > 0 && (
            <div>
              <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Geotagged Anomalies ({searchResults.anomalies.length})
              </span>
              <div className="mt-1 space-y-1">
                {searchResults.anomalies.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => {
                      router.push(`/map?anomalyId=${a.id}&lat=${a.latitude}&lng=${a.longitude}`);
                      onClose();
                    }}
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-transparent p-2 hover:border-cyan-500/40 hover:bg-[#0d1627]"
                  >
                    <div className="flex items-center gap-2.5">
                      <HazardBadge hazardClass={a.hazardClass} size="sm" />
                      <div>
                        <p className="text-xs font-bold text-white">{a.label}</p>
                        <p className="font-mono text-[10px] text-slate-400">
                          {a.zone} · {a.latitude.toFixed(4)}°N, {a.longitude.toFixed(4)}°E · Depth {a.depthM}m
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Surveys */}
          {searchResults.surveys.length > 0 && (
            <div>
              <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Surveys ({searchResults.surveys.length})
              </span>
              <div className="mt-1 space-y-1">
                {searchResults.surveys.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      router.push(`/map?surveyId=${s.id}`);
                      onClose();
                    }}
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-transparent p-2 hover:border-cyan-500/40 hover:bg-[#0d1627]"
                  >
                    <div>
                      <p className="font-mono text-xs font-bold text-cyan-300">{s.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {s.vessel} · {s.sonarModel} ({s.format}) · {s.anomalyCount} anomalies
                      </p>
                    </div>
                    <span className="rounded bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] text-cyan-400">
                      {s.zone}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
