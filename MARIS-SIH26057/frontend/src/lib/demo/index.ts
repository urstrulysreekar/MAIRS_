'use client';

import { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import { demoStore, DemoState } from './store';
import { Anomaly, Survey, FilterState, KPIMetrics, ProcessingJob, TacticalAlert } from './types';

export * from './types';
export * from './seed';
export * from './generator';
export * from './proceduralSonar';
export * from './store';

/**
 * Flag determining whether the UI should use the local deterministic demo layer
 * or fall through to live Supabase PostGIS instances.
 * Default is TRUE for zero-config, immediate demo reliability.
 */
export const IS_DEMO_MODE =
  process.env.NEXT_PUBLIC_DEMO_MODE !== 'false' &&
  process.env.NEXT_PUBLIC_DEMO_MODE !== '0';


/**
 * React Hook that subscribes to the reactive DemoDataStore.
 */
export function useDemoStore(): DemoState {
  const state = useSyncExternalStore(
    (onStoreChange) => demoStore.subscribe(onStoreChange),
    () => demoStore.getState(),
    () => demoStore.getState() // SSR snapshot
  );
  return state;
}

/**
 * React Hook providing the unified filtered anomaly list based on current Global Filter Bar state.
 */
export function useFilteredAnomalies(): {
  anomalies: Anomaly[];
  totalUnfiltered: number;
  filters: FilterState;
  setFilters: (updater: Partial<FilterState> | ((prev: FilterState) => FilterState)) => void;
  resetFilters: () => void;
} {
  const { anomalies, filters } = useDemoStore();

  const filtered = useMemo(() => {
    return anomalies.filter((a) => {
      // 1. Search Query
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const match =
          a.label.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          a.surveyName.toLowerCase().includes(q) ||
          a.zone.toLowerCase().includes(q) ||
          a.hazardClass.toLowerCase().includes(q);
        if (!match) return false;
      }

      // 2. Zone Filter
      if (filters.selectedZone !== 'all' && a.zone !== filters.selectedZone) {
        return false;
      }

      // 3. Class Filter
      if (filters.selectedClass !== 'all' && a.hazardClass !== filters.selectedClass) {
        return false;
      }

      // 4. Severity Filter
      if (filters.selectedSeverity !== 'all' && a.severity !== filters.selectedSeverity) {
        return false;
      }

      // 5. Status Filter
      if (filters.selectedStatus !== 'all' && a.status !== filters.selectedStatus) {
        return false;
      }

      // 6. Survey Filter
      if (filters.selectedSurveyId !== 'all' && a.surveyId !== filters.selectedSurveyId) {
        return false;
      }

      // 7. Minimum Confidence
      if (a.confidence != null && a.confidence < filters.minConfidence) {
        return false;
      }

      // 8. Time Range
      if (filters.timeRange !== 'all') {
        const itemTime = new Date(a.timestamp).getTime();
        const now = Date.now();
        const diffHours = (now - itemTime) / (1000 * 3600);
        if (filters.timeRange === '24h' && diffHours > 24) return false;
        if (filters.timeRange === '7d' && diffHours > 24 * 7) return false;
        if (filters.timeRange === '30d' && diffHours > 24 * 30) return false;
      }

      return true;
    });
  }, [anomalies, filters]);

  return {
    anomalies: filtered,
    totalUnfiltered: anomalies.length,
    filters,
    setFilters: demoStore.setFilters.bind(demoStore),
    resetFilters: demoStore.resetFilters.bind(demoStore),
  };
}

/**
 * Hook providing computed KPI Metrics with animated sparklines and deltas.
 */
export function useKPIMetrics(): KPIMetrics {
  const _state = useDemoStore();
  return useMemo(() => demoStore.getKPIMetrics(), [_state]);
}
