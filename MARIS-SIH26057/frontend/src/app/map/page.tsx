'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useDemoStore, useFilteredAnomalies, demoStore } from '@/lib/demo';
import { Anomaly } from '@/lib/demo/types';
import { HazardBadge, SeverityPill } from '@/components/ui/Badge';
import DetailDrawer from '@/components/ui/DetailDrawer';
import clsx from 'clsx';

// Dynamic import with SSR disabled for Leaflet container
const LiveMap = dynamic(() => import('@/components/LiveMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 skeleton-box rounded-sm"></div>
        <p className="font-mono text-xs text-[#8c978f]">
          Loading CARTO Dark Matter Nautical Tiles &amp; PostGIS Geometries...
        </p>
      </div>
    </div>
  ),
});

interface FeedRowProps {
  item: Anomaly;
  isSelected?: boolean;
  onSelect?: (item: Anomaly) => void;
}

const FeedRow = React.memo(
  function FeedRow({ item, isSelected, onSelect }: FeedRowProps) {
    return (
      <div
        onClick={() => onSelect?.(item)}
        className={clsx(
          'cursor-pointer rounded-sm border p-3 transition-all duration-150',
          isSelected
            ? 'border-[#3b7b99] bg-[#3b7b99]/10'
            : 'border-[rgba(226,232,228,0.08)] bg-[#101622] hover:border-[#3b7b99]/50 hover:bg-[#161e2e]'
        )}
      >
        <div className="flex items-start justify-between">
          <HazardBadge hazardClass={item.hazardClass} size="sm" />
          <SeverityPill severity={item.severity} />
        </div>

        <p className="mt-2 text-xs font-bold text-[#e2e8e4] leading-snug">{item.label}</p>

        <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 font-mono text-[10px] text-[#8c978f]">
          <div className="flex items-center gap-1">
            <svg className="h-3 w-3 text-[#3b7b99]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx={12} cy={9} r={2.5}/></svg>
            <span>{item.latitude == null ? 'Not recorded' : `${item.latitude.toFixed(4)}°N`}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="h-3 w-3 text-[#3b7b99]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx={12} cy={9} r={2.5}/></svg>
            <span>{item.longitude == null ? 'Not recorded' : `${item.longitude.toFixed(4)}°E`}</span>
          </div>
          <div className="col-span-2 text-[#4d5750]">
            Depth: {item.depthM == null ? 'Not recorded' : `${item.depthM}m`} · Conf:{' '}
            {item.confidence == null ? 'Not recorded' : `${(item.confidence * 100).toFixed(0)}%`}
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between border-t border-[rgba(226,232,228,0.08)] pt-2 text-[10px] text-[#8c978f] font-mono">
          <span>{item.zone}</span>
          <span className="text-[#3b7b99] flex items-center gap-0.5 font-bold">
            Inspect <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="m9 18 6-6-6-6"/></svg>
          </span>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.confidence === nextProps.item.confidence &&
    prevProps.isSelected === nextProps.isSelected
);

function MapDashboardContent() {
  const searchParams = useSearchParams();
  const urlAnomalyId = searchParams?.get('anomalyId');
  const urlSurveyId = searchParams?.get('surveyId');

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { surveys } = useDemoStore();
  const { anomalies, filters, setFilters, totalUnfiltered } = useFilteredAnomalies();

  const [feedAnomalies, setFeedAnomalies] = useState<Anomaly[]>([]);
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string | null>(urlAnomalyId || null);
  const [detailDrawerAnomaly, setDetailDrawerAnomaly] = useState<Anomaly | null>(null);

  // Throttle buffer for incoming telemetry events
  const incomingBuffer = useRef<Anomaly[]>([]);

  // Initial load / filter sync
  useEffect(() => {
    setFeedAnomalies(anomalies.slice(0, 20));
  }, [anomalies]);

  // Real-time listener: push payloads directly into mutable buffer
  useEffect(() => {
    const unsubscribe = demoStore.subscribe(() => {
      const state = demoStore.getState();
      if (state.lastSimulatedAnomaly) {
        incomingBuffer.current.push(state.lastSimulatedAnomaly);
      }
    });
    return () => unsubscribe();
  }, []);

  // Batch and cap: interval ticks every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      if (incomingBuffer.current.length === 0) return;
      const buffered = [...incomingBuffer.current];
      incomingBuffer.current = [];
      setFeedAnomalies((prev) => [...buffered, ...prev].slice(0, 20));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (urlAnomalyId) {
      setSelectedAnomalyId(urlAnomalyId);
      const target = anomalies.find((a) => a.id === urlAnomalyId);
      if (target) setDetailDrawerAnomaly(target);
    }
  }, [urlAnomalyId, anomalies]);

  // Handle surveyId URL param from upload/CommandPalette navigation
  useEffect(() => {
    if (urlSurveyId) {
      setFilters({ selectedSurveyId: urlSurveyId });
    }
  }, [urlSurveyId]);

  return (
    <div className="flex h-[calc(100vh-6.5rem)] gap-4 overflow-hidden">
      {/* ── Left Realtime Telemetry Feed Sidebar ── */}
      <div className="flex w-96 flex-col rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018]">
        {/* Header with Search & Quick Filters */}
        <div className="border-b border-[rgba(226,232,228,0.08)] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-[#3b7b99]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <h2 className="font-mono text-xs font-bold text-[#e2e8e4] uppercase tracking-wider">
                Live Anomaly Feed
              </h2>
            </div>
            <span suppressHydrationWarning className="rounded-sm bg-[#3b7b99]/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#3b7b99]">
              {anomalies.length} / {totalUnfiltered}
            </span>
          </div>

          {/* Quick search */}
          <div className="relative">
            <svg className="absolute top-2.5 left-2.5 h-4 w-4 text-[#8c978f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx={10} cy={10} r={7}/><path d="m21 21-5.2-5.2"/></svg>
            <input
              type="text"
              placeholder="Search target label, ID, zone..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ searchQuery: e.target.value })}
              className="w-full rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#101622] py-1.5 pr-3 pl-8 text-xs text-[#e2e8e4] placeholder-[#8c978f] focus:border-[#3b7b99] focus:outline-none"
            />
          </div>

          {/* Hazard Class & Severity Selectors */}
          <div className="flex gap-2">
            <select
              value={filters.selectedClass}
              onChange={(e) => setFilters({ selectedClass: e.target.value })}
              className="w-full rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#101622] px-2 py-1.5 text-xs text-[#8c978f] focus:border-[#3b7b99] focus:outline-none"
            >
              <option value="all">All Hazards</option>
              <option value="ghost_net">Ghost Nets</option>
              <option value="wreck_debris">Wreck Debris</option>
              <option value="uxo">UXO Munitions</option>
              <option value="pipeline">Pipelines</option>
              <option value="biological">Coral Reefs</option>
              <option value="geological">Geological</option>
            </select>

            <select
              value={filters.selectedSeverity}
              onChange={(e) => setFilters({ selectedSeverity: e.target.value })}
              className="w-32 rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#101622] px-2 py-1.5 text-xs text-[#8c978f] focus:border-[#3b7b99] focus:outline-none"
            >
              <option value="all">Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>
          </div>
        </div>

        {/* Scrollable Anomaly Cards Feed */}
        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {isMounted ? (
            feedAnomalies.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center p-4">
                <svg className="h-6 w-6 text-[#8c978f] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 6.375a1.5 1.5 0 0 0 1.299 2.25h16.008a1.5 1.5 0 0 0 1.3-2.25L13.3 3.375a1.5 1.5 0 0 0-2.6 0L2.697 19.125zM12 18h.008v.008H12V18z" />
                </svg>
                <p className="text-xs text-[#8c978f]">No sonar anomalies match the active filters.</p>
              </div>
            ) : (
              feedAnomalies.map((item, index) => (
                <FeedRow
                  key={`${item.id}-${index}`}
                  item={item}
                  isSelected={item.id === selectedAnomalyId}
                  onSelect={(selected) => {
                    setSelectedAnomalyId(selected.id);
                    setDetailDrawerAnomaly(selected);
                  }}
                />
              ))
            )
          ) : (
            <div className="p-4 text-xs text-[#8c978f]">Loading feed...</div>
          )}
        </div>
      </div>

      {/* ── Right Main Live Leaflet Map Container ── */}
      <div className="flex-1">
        <LiveMap
          anomalies={anomalies}
          surveys={surveys}
          selectedAnomalyId={selectedAnomalyId}
          onSelectAnomaly={(a) => {
            setSelectedAnomalyId(a.id);
            setDetailDrawerAnomaly(a);
          }}
        />
      </div>

      {/* Detail Drawer on Click */}
      <DetailDrawer
        anomaly={detailDrawerAnomaly}
        onClose={() => {
          setDetailDrawerAnomaly(null);
          setSelectedAnomalyId(null);
        }}
      />
    </div>
  );
}

export default function MapDashboardPage() {
  return (
    <Suspense fallback={<div className="text-xs font-mono text-[#8c978f] p-8">Loading Map Telemetry...</div>}>
      <MapDashboardContent />
    </Suspense>
  );
}
