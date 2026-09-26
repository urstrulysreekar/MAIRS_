'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFilteredAnomalies } from '@/lib/demo';
import { Anomaly, HazardClass, Severity, ReviewStatus } from '@/lib/demo/types';
import GlobalFilterBar from '@/components/ui/GlobalFilterBar';
import { HazardBadge, SeverityPill, StatusChip } from '@/components/ui/Badge';
import DetailDrawer from '@/components/ui/DetailDrawer';

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
      if (vA == null && vB == null) return 0;
      if (vA == null) return sortAsc ? -1 : 1;
      if (vB == null) return sortAsc ? 1 : -1;

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
          <h1 className="text-2xl font-black tracking-tight text-[#e2e8e4] sm:text-3xl">
            Target Anomaly Master Inventory
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#8c978f]">
            Comprehensive registry of verified subsea hazards, ghost nets, wreck debris, and PostGIS geolocations.
          </p>
        </div>

        {/* Export CSV Button */}
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 rounded-sm bg-[#161e2e] border border-[rgba(226,232,228,0.08)] px-4 py-2 text-xs font-bold text-[#3b7b99] hover:bg-[#101622] transition-colors"
        >
          <span>≡</span>
          <span>Export Inventory (CSV)</span>
        </button>
      </div>

      {/* Global Filter Bar */}
      <GlobalFilterBar />

      {/* Main Table Panel */}
      <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018]">
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[rgba(226,232,228,0.08)] font-mono text-[10px] text-[#8c978f] uppercase">
                <th
                  onClick={() => handleSort('id')}
                  className="pb-3 cursor-pointer hover:text-[#3b7b99]"
                >
                  <span className="flex items-center gap-1">
                    ID <span>↕</span>
                  </span>
                </th>
                <th
                  onClick={() => handleSort('hazardClass')}
                  className="pb-3 cursor-pointer hover:text-[#3b7b99]"
                >
                  <span className="flex items-center gap-1">
                    Classification <span>↕</span>
                  </span>
                </th>
                <th
                  onClick={() => handleSort('zone')}
                  className="pb-3 cursor-pointer hover:text-[#3b7b99]"
                >
                  <span className="flex items-center gap-1">
                    Zone <span>↕</span>
                  </span>
                </th>
                <th
                  onClick={() => handleSort('latitude')}
                  className="pb-3 cursor-pointer hover:text-[#3b7b99]"
                >
                  <span className="flex items-center gap-1">
                    Coordinates <span>↕</span>
                  </span>
                </th>
                <th
                  onClick={() => handleSort('confidence')}
                  className="pb-3 cursor-pointer hover:text-[#3b7b99]"
                >
                  <span className="flex items-center gap-1">
                    Confidence <span>↕</span>
                  </span>
                </th>
                <th
                  onClick={() => handleSort('areaM2')}
                  className="pb-3 cursor-pointer hover:text-[#3b7b99]"
                >
                  <span className="flex items-center gap-1">
                    Footprint <span>↕</span>
                  </span>
                </th>
                <th
                  onClick={() => handleSort('severity')}
                  className="pb-3 cursor-pointer hover:text-[#3b7b99]"
                >
                  <span className="flex items-center gap-1">
                    Severity <span>↕</span>
                  </span>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="pb-3 cursor-pointer hover:text-[#3b7b99]"
                >
                  <span className="flex items-center gap-1">
                    Review Status <span>↕</span>
                  </span>
                </th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(226,232,228,0.08)]">
              {paginatedAnomalies.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedAnomaly(item)}
                  className="cursor-pointer hover:bg-[#101622] transition-colors group"
                >
                  <td className="py-3 font-mono font-bold text-[#3b7b99]">{item.id}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <HazardBadge hazardClass={item.hazardClass} size="sm" />
                      <span className="font-bold text-[#e2e8e4] truncate max-w-[150px]">
                        {item.label}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 font-mono text-[11px] text-[#8c978f]">{item.zone}</td>
                  <td className="py-3 font-mono text-[11px] text-[#8c978f]">
                    {item.latitude == null || item.longitude == null
                      ? 'Not geotagged'
                      : `${item.latitude.toFixed(4)}°N, ${item.longitude.toFixed(4)}°E`}
                    {item.depthM == null ? '' : ` (D: ${item.depthM}m)`}
                  </td>
                  <td className="py-3 font-mono font-bold text-[#5b937c]">
                    {item.confidence == null ? 'Not recorded' : `${(item.confidence * 100).toFixed(1)}%`}
                  </td>
                  <td className="py-3 font-mono text-[11px] text-[#8c978f]">
                    {item.lengthM == null || item.widthM == null || item.areaM2 == null
                      ? 'Not recorded'
                      : `${item.lengthM}m × ${item.widthM}m (${item.areaM2}m²)`}
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
                      className="rounded-sm bg-[#101622] border border-[rgba(226,232,228,0.08)] px-2.5 py-1 font-mono text-[10px] font-bold text-[#3b7b99] group-hover:border-[rgba(226,232,228,0.18)] group-hover:bg-[#161e2e]"
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
        <div className="flex items-center justify-between border-t border-[rgba(226,232,228,0.08)] p-4 font-mono text-xs text-[#8c978f]">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} -{' '}
            {Math.min(currentPage * pageSize, sortedAnomalies.length)} of{' '}
            {sortedAnomalies.length} entries
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#101622] p-1.5 text-[#8c978f] disabled:opacity-30 hover:bg-[#161e2e]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <span className="font-bold text-[#e2e8e4]">
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#101622] p-1.5 text-[#8c978f] disabled:opacity-30 hover:bg-[#161e2e]"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Slide-out detail drawer */}
      <DetailDrawer anomaly={selectedAnomaly} onClose={() => setSelectedAnomaly(null)} />
    </div>
  );
}
