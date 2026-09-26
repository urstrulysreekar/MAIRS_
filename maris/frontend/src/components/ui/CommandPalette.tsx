'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useDemoStore, demoStore } from '@/lib/demo';
import { HazardBadge } from './Badge';
import { useRouter } from 'next/navigation';

export default function CommandPalette({
  isOpen,
  onClose,
  onSelectAnomaly,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectAnomaly?: (anomaly: any) => void;
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-[#070a0f]/90">
      <div className="flex-1 absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] p-4 overflow-hidden">
        {/* Search Bar Input */}
        <div className="relative flex items-center border-b border-[rgba(226,232,228,0.08)] pb-3">
          <svg className="h-5 w-5 text-[#3b7b99] mr-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx={10} cy={10} r={7}/><path d="m21 21-5.2-5.2"/></svg>
          <input
            type="text"
            placeholder="Search anomalies, survey files, maritime zones, or commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-[#e2e8e4] placeholder-[#4d5750] focus:outline-none"
          />
          <button onClick={onClose} className="rounded-sm p-1 text-[#8c978f] hover:bg-[#161e2e] hover:text-[#e2e8e4]">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Quick Navigation Pages */}
        {!query && (
          <div className="mt-3 border-b border-[rgba(226,232,228,0.08)] pb-3">
            <span className="font-mono text-[10px] font-bold text-[#8c978f] uppercase tracking-wider">Quick Navigation</span>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs font-semibold">
              <button
                onClick={() => {
                  router.push('/console');
                  onClose();
                }}
                className="flex items-center gap-2 rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#101622] p-2 text-[#e2e8e4] hover:border-[#3b7b99] hover:text-[#e2e8e4]"
              >
                <svg className="h-4 w-4 text-[#3b7b99]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Operations
              </button>
              <button
                onClick={() => {
                  router.push('/map');
                  onClose();
                }}
                className="flex items-center gap-2 rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#101622] p-2 text-[#e2e8e4] hover:border-[#3b7b99] hover:text-[#e2e8e4]"
              >
                <svg className="h-4 w-4 text-[#3b7b99]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={10}/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg> PostGIS Map
              </button>
              <button
                onClick={() => {
                  router.push('/upload');
                  onClose();
                }}
                className="flex items-center gap-2 rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#101622] p-2 text-[#e2e8e4] hover:border-[#3b7b99] hover:text-[#e2e8e4]"
              >
                <span className="text-[#3b7b99] font-bold">↑</span> Ingestion
              </button>
              <button
                onClick={() => {
                  router.push('/anomalies');
                  onClose();
                }}
                className="flex items-center gap-2 rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#101622] p-2 text-[#e2e8e4] hover:border-[#3b7b99] hover:text-[#e2e8e4]"
              >
                <svg className="h-4 w-4 text-[#3b7b99]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg> Target Inventory
              </button>
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="mt-3 max-h-80 overflow-y-auto space-y-3">
          {/* Quick Filter Commands */}
          {quickFilterCommands.length > 0 && (
            <div>
              <span className="font-mono text-[10px] font-bold text-[#8c978f] uppercase tracking-wider">
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
                    className="flex cursor-pointer items-center justify-between rounded-sm border border-transparent p-2 hover:border-[#3b7b99]/40 hover:bg-[#101622]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#3b7b99]/10 border border-[#3b7b99]/30 text-[#3b7b99]">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#e2e8e4]">{fc.label}</p>
                        <p className="font-mono text-[10px] text-[#8c978f]">{fc.desc}</p>
                      </div>
                    </div>
                    <span className="rounded-sm bg-[#3b7b99]/10 px-2 py-0.5 font-mono text-[10px] text-[#3b7b99] font-bold">
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
              <span className="font-mono text-[10px] font-bold text-[#8c978f] uppercase tracking-wider">
                Geotagged Anomalies ({searchResults.anomalies.length})
              </span>
              <div className="mt-1 space-y-1">
                {searchResults.anomalies.map((a) => {
                  const hasCoords = a.latitude != null && a.longitude != null;

                  return (
                    <div
                      key={a.id}
                      onClick={() => {
                        if (onSelectAnomaly) {
                          onSelectAnomaly(a);
                        } else if (hasCoords) {
                          router.push(`/map?anomalyId=${a.id}&lat=${a.latitude}&lng=${a.longitude}`);
                        }
                        onClose();
                      }}
                      className="flex cursor-pointer items-center justify-between rounded-sm border border-transparent p-2 hover:border-[#3b7b99]/40 hover:bg-[#101622]"
                    >
                      <div className="flex items-center gap-2.5">
                        <HazardBadge hazardClass={a.hazardClass} size="sm" />
                        <div>
                          <p className="text-xs font-bold text-[#e2e8e4]">{a.label}</p>
                          <p className="font-mono text-[10px] text-[#8c978f]">
                            {a.zone} ·{' '}
                            {hasCoords
                              ? `${a.latitude!.toFixed(4)}°N, ${a.longitude!.toFixed(4)}°E`
                              : 'Not geotagged'}{' '}
                            · Depth {a.depthM == null ? 'Not recorded' : `${a.depthM}m`}
                          </p>
                        </div>
                      </div>
                      <span className="text-[#8c978f] font-bold">→</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Surveys */}
          {searchResults.surveys.length > 0 && (
            <div>
              <span className="font-mono text-[10px] font-bold text-[#8c978f] uppercase tracking-wider">
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
                    className="flex cursor-pointer items-center justify-between rounded-sm border border-transparent p-2 hover:border-[#3b7b99]/40 hover:bg-[#101622]"
                  >
                    <div>
                      <p className="font-mono text-xs font-bold text-[#3b7b99]">{s.name}</p>
                      <p className="text-[10px] text-[#8c978f]">
                        {s.vessel} · {s.sonarModel} ({s.format}) · {s.anomalyCount} anomalies
                      </p>
                    </div>
                    <span className="rounded-sm bg-[#3b7b99]/10 px-2 py-0.5 font-mono text-[10px] text-[#3b7b99]">
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
