'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFilteredAnomalies } from '@/lib/demo';
import { Anomaly, HazardClass, Severity, ReviewStatus } from '@/lib/demo/types';
import GlobalFilterBar from '@/components/ui/GlobalFilterBar';
import { HazardBadge, SeverityPill, StatusChip } from '@/components/ui/Badge';
import DetailDrawer from '@/components/ui/DetailDrawer';
import {
  Download,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Compass,
  ArrowUpDown,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import clsx from 'clsx';

export default function TargetInventoryPage() {
  const { anomalies, totalUnfiltered } = useFilteredAnomalies();
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);

  // Sorting & Pagination state
  const [sortField, setSortField] = useState<keyof Anomaly>('confidence');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const sortedAnomalies = useMemo(() => {
    return [...anomalies].sort((a, b) => {
      let vA = a[sortField];
      let vB = b[sortField];
      if (vA === undefined && vB === undefined) return 0;
      if (vA === undefined) return sortAsc ? -1 : 1;
      if (vB === undefined) return sortAsc ? 1 : -1;

      if (typeof vA === 'string' && typeof vB === 'string') {
        return sortAsc ? vA.localeCompare(vB) : vB.localeCompare(vA);
      }

      if (vA < vB) return sortAsc ? -1 : 1;
      if (vA > vB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [anomalies, sortField, sortAsc]);

  const totalPages = Math.ceil(sortedAnomalies.length / pageSize) || 1;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedAnomalies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedAnomalies.slice(start, start + pageSize);
  }, [sortedAnomalies, currentPage]);

  const handleSort = (field: keyof Anomaly) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Anomaly_ID',
      'Survey_Name',
      'Zone',
      'Hazard_Class',
      'Label',
      'Confidence',
      'Latitude',
      'Longitude',
      'Depth_M',
      'Length_M',
      'Width_M',
      'Area_M2',
      'Severity',
      'Status',
      'Timestamp',
    ];

    const rows = anomalies.map((a) => [
      a.id,
      `"${a.surveyName}"`,
      `"${a.zone}"`,
      a.hazardClass,
      `"${a.label}"`,
      a.confidence,
      a.latitude,
      a.longitude,
      a.depthM,
      a.lengthM,
      a.widthM,
      a.areaM2,
      a.severity,
      a.status,
      a.timestamp,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    if (typeof window === 'undefined' || !document?.body) return;
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MARIS_TARGET_INVENTORY_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Target Anomaly Master Inventory
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">
            Comprehensive registry of verified subsea hazards, ghost nets, wreck debris, and PostGIS geolocations.
          </p>
        </div>

        {/* Export CSV Button */}
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 px-4 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition-colors"
        >
          <FileSpreadsheet className="h-4 w-4 text-cyan-400" />
          <span>Export Inventory (CSV)</span>
        </button>
      </div>

      {/* Global Filter Bar */}
      <GlobalFilterBar />

      {/* Main Table Panel */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[#0d1627]/90 shadow-2xl backdrop-blur-xl">
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border)] font-mono text-[10px] text-slate-400 uppercase">
                <th
                  onClick={() => handleSort('id')}
                  className="pb-3 cursor-pointer hover:text-cyan-400"
                >
                  <span className="flex items-center gap-1">
                    ID <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('hazardClass')}
                  className="pb-3 cursor-pointer hover:text-cyan-400"
                >
                  <span className="flex items-center gap-1">
                    Classification <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('zone')}
                  className="pb-3 cursor-pointer hover:text-cyan-400"
                >
                  <span className="flex items-center gap-1">
                    Zone <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('latitude')}
                  className="pb-3 cursor-pointer hover:text-cyan-400"
                >
                  <span className="flex items-center gap-1">
                    Coordinates <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('confidence')}
                  className="pb-3 cursor-pointer hover:text-cyan-400"
                >
                  <span className="flex items-center gap-1">
                    Confidence <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('areaM2')}
                  className="pb-3 cursor-pointer hover:text-cyan-400"
                >
                  <span className="flex items-center gap-1">
                    Footprint <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('severity')}
                  className="pb-3 cursor-pointer hover:text-cyan-400"
                >
                  <span className="flex items-center gap-1">
                    Severity <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="pb-3 cursor-pointer hover:text-cyan-400"
                >
                  <span className="flex items-center gap-1">
                    Review Status <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {paginatedAnomalies.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedAnomaly(item)}
                  className="cursor-pointer hover:bg-cyan-500/5 transition-colors group"
                >
                  <td className="py-3 font-mono font-bold text-cyan-400">{item.id}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <HazardBadge hazardClass={item.hazardClass} size="sm" />
                      <span className="font-bold text-white truncate max-w-[150px]">
                        {item.label}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 font-mono text-[11px] text-slate-300">{item.zone}</td>
                  <td className="py-3 font-mono text-[11px] text-slate-400">
                    {item.latitude.toFixed(4)}°N, {item.longitude.toFixed(4)}°E (D: {item.depthM}m)
                  </td>
                  <td className="py-3 font-mono font-bold text-emerald-400">
                    {(item.confidence * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 font-mono text-[11px] text-slate-300">
                    {item.lengthM}m × {item.widthM}m ({item.areaM2}m²)
                  </td>
                  <td className="py-3">
                    <SeverityPill severity={item.severity} />
                  </td>
                  <td className="py-3">
                    <StatusChip status={item.status} />
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setSelectedAnomaly(item)}
                      className="rounded bg-[#121d33] border border-[var(--color-border)] px-2.5 py-1 font-mono text-[10px] font-bold text-cyan-300 group-hover:border-cyan-400 group-hover:bg-cyan-500/20"
                    >
                      Inspect →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between border-t border-[var(--color-border)] p-4 font-mono text-xs text-slate-400">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} -{' '}
            {Math.min(currentPage * pageSize, sortedAnomalies.length)} of{' '}
            {sortedAnomalies.length} entries
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-[var(--color-border)] bg-[#060a12] p-1.5 text-slate-300 disabled:opacity-30 hover:bg-[#121d33]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-bold text-white">
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-[var(--color-border)] bg-[#060a12] p-1.5 text-slate-300 disabled:opacity-30 hover:bg-[#121d33]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-out detail drawer */}
      <DetailDrawer anomaly={selectedAnomaly} onClose={() => setSelectedAnomaly(null)} />
    </div>
  );
}
