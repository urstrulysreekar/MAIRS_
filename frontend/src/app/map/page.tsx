'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useDemoStore, useFilteredAnomalies, demoStore } from '@/lib/demo';
import { Anomaly } from '@/lib/demo/types';
import { HazardBadge, SeverityPill } from '@/components/ui/Badge';
import DetailDrawer from '@/components/ui/DetailDrawer';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Clock,
  Layers,
  ChevronRight,
  Shield,
  Download,
  AlertCircle,
  Filter,
} from 'lucide-react';
import clsx from 'clsx';

// Dynamic import with SSR disabled for Leaflet container
const LiveMap = dynamic(() => import('@/components/LiveMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-xl border border-[var(--color-border)] bg-[#060a12]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent"></div>
        <p className="font-mono text-xs text-slate-400">
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
          'cursor-pointer rounded-xl border p-3 transition-all duration-150',
          isSelected
            ? 'border-cyan-400 bg-cyan-500/10 shadow-lg'
            : 'border-[var(--color-border)] bg-[#0d1627] hover:border-cyan-500/50 hover:bg-[#121d33]'
        )}
      >
        <div className="flex items-start justify-between">
          <HazardBadge hazardClass={item.hazardClass} size="sm" />
          <SeverityPill severity={item.severity} />
        </div>

        <p className="mt-2 text-xs font-bold text-white leading-snug">{item.label}</p>

        <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 font-mono text-[10px] text-slate-400">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-cyan-400" />
            <span>{item.latitude.toFixed(4)}°N</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-cyan-400" />
            <span>{item.longitude.toFixed(4)}°E</span>
          </div>
          <div className="col-span-2 text-slate-300">
            Depth: {item.depthM}m · Conf: {(item.confidence * 100).toFixed(0)}%
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-2 text-[10px] text-slate-400 font-mono">
          <span>{item.zone}</span>
          <span className="text-cyan-400 flex items-center gap-0.5 font-bold">
            Inspect <ChevronRight className="h-3 w-3" />
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
      <div className="flex w-96 flex-col rounded-xl border border-[var(--color-border)] bg-[#0a1120] shadow-2xl">
        {/* Header with Search & Quick Filters */}
        <div className="border-b border-[var(--color-border)] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-400" />
              <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Live Anomaly Feed
              </h2>
            </div>
            <span suppressHydrationWarning className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-cyan-400">
              {anomalies.length} / {totalUnfiltered}
            </span>
          </div>

          {/* Quick search */}
          <div className="relative">
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search target label, ID, zone..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ searchQuery: e.target.value })}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[#060a12] py-1.5 pr-3 pl-8 text-xs text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {/* Hazard Class & Severity Selectors */}
          <div className="flex gap-2">
            <select
              value={filters.selectedClass}
              onChange={(e) => setFilters({ selectedClass: e.target.value })}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[#060a12] px-2 py-1.5 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
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
              className="w-32 rounded-lg border border-[var(--color-border)] bg-[#060a12] px-2 py-1.5 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
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
                <AlertCircle className="h-8 w-8 text-slate-500 mb-2" />
                <p className="text-xs text-slate-400">No sonar anomalies match the active filters.</p>
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
            <div className="p-4 text-xs text-slate-500">Loading feed...</div>
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
    <Suspense fallback={<div className="text-xs font-mono text-slate-400 p-8">Loading Map Telemetry...</div>}>
      <MapDashboardContent />
    </Suspense>
  );
}

