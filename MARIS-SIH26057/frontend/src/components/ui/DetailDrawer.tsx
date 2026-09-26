'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Anomaly, ReviewStatus } from '@/lib/demo/types';
import { demoStore } from '@/lib/demo/store';
import { useDemoStore } from '@/lib/demo';
import SonarThumbnail from './SonarThumbnail';
import { HazardBadge, SeverityPill, StatusChip } from './Badge';
import Link from 'next/link';

interface DetailDrawerProps {
  anomaly: Anomaly | null;
  onClose: () => void;
}

export default function DetailDrawer({ anomaly, onClose }: DetailDrawerProps) {
  // Subscribe to live store so status changes (Verify/Dispatch/Clear) are reflected immediately
  const { anomalies: storeAnomalies } = useDemoStore();
  const liveAnomaly = useMemo(() => {
    if (!anomaly) return null;
    return storeAnomalies.find((a) => a.id === anomaly.id) || anomaly;
  }, [anomaly, storeAnomalies]);

  const [notes, setNotes] = useState(liveAnomaly?.notes || '');
  const [assignedTeam, setAssignedTeam] = useState(liveAnomaly?.assignedTeam || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNotes(liveAnomaly?.notes || '');
    setAssignedTeam(liveAnomaly?.assignedTeam || '');
  }, [liveAnomaly?.id]);

  if (!liveAnomaly) return null;

  const confidenceText =
    liveAnomaly.confidence == null ? 'Not recorded' : `${(liveAnomaly.confidence * 100).toFixed(1)}%`;
  const latitudeText =
    liveAnomaly.latitude == null ? 'Not geotagged' : `${liveAnomaly.latitude.toFixed(5)}° N`;
  const longitudeText =
    liveAnomaly.longitude == null ? 'Not geotagged' : `${liveAnomaly.longitude.toFixed(5)}° E`;
  const depthText = liveAnomaly.depthM == null ? 'Not recorded' : `${liveAnomaly.depthM.toFixed(1)} m`;
  const altitudeText =
    liveAnomaly.altitudeM == null ? 'Not recorded' : `${liveAnomaly.altitudeM.toFixed(1)} m`;
  const lengthText = liveAnomaly.lengthM == null ? 'Not recorded' : `${liveAnomaly.lengthM} m`;
  const widthText = liveAnomaly.widthM == null ? 'Not recorded' : `${liveAnomaly.widthM} m`;
  const areaText = liveAnomaly.areaM2 == null ? 'Not recorded' : `${liveAnomaly.areaM2} m²`;
  const hasCoords = liveAnomaly.latitude != null && liveAnomaly.longitude != null;

  const handleStatusChange = (newStatus: ReviewStatus) => {
    setIsSaving(true);
    demoStore.updateAnomalyStatus(liveAnomaly.id, newStatus, notes, assignedTeam);
    setTimeout(() => setIsSaving(false), 300);
  };

  const handleSaveNotes = () => {
    setIsSaving(true);
    demoStore.updateAnomalyStatus(liveAnomaly.id, liveAnomaly.status, notes, assignedTeam);
    setTimeout(() => setIsSaving(false), 300);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end bg-[#070a0f]/90">
      {/* Backdrop overlay */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide-out Panel */}
      <div className="relative flex h-full w-full max-w-xl flex-col border-l border-[rgba(226,232,228,0.08)] bg-[#0b1018] p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[rgba(226,232,228,0.08)] pb-4 gap-3 overflow-hidden">
          <div className="space-y-1 min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center gap-2">
              <HazardBadge hazardClass={liveAnomaly.hazardClass} size="md" />
              <SeverityPill severity={liveAnomaly.severity} />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#e2e8e4] truncate break-all">{liveAnomaly.label}</h2>
            <p className="font-mono text-xs text-[#8c978f] truncate break-all">
              ANOMALY ID: <span className="text-[#3b7b99] font-bold">{liveAnomaly.id}</span> · PING #{liveAnomaly.pingIndex}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-sm border border-[rgba(226,232,228,0.08)] p-1.5 text-[#8c978f] hover:bg-[#161e2e] hover:text-[#e2e8e4] shrink-0"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-6 overflow-hidden">
          {/* 1. Procedural Sonar Acoustic Waterfall View */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#8c978f]">
                Acoustic Waterfall Backscatter Tile
              </span>
              <span className="font-mono text-[11px] font-semibold text-[#5b937c]">
                Confidence: {confidenceText}
              </span>
            </div>
            <SonarThumbnail
              hazardClass={liveAnomaly.hazardClass}
              seed={liveAnomaly.snippetSeed}
              height={180}
              className="w-full"
            />
          </div>

          {/* 2. Georeference & Bathymetry Grid */}
          <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#101622] p-4">
            <h3 className="mb-3 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#3b7b99]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={10}/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg> PostGIS Sub-Meter Coordinates
            </h3>
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] p-2.5">
                <span className="text-[10px] text-[#8c978f]">Latitude (WGS84):</span>
                <p className="mt-0.5 font-bold text-[#e2e8e4]">{latitudeText}</p>
              </div>
              <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] p-2.5">
                <span className="text-[10px] text-[#8c978f]">Longitude (WGS84):</span>
                <p className="mt-0.5 font-bold text-[#e2e8e4]">{longitudeText}</p>
              </div>
              <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] p-2.5">
                <span className="text-[10px] text-[#8c978f]">Bathymetric Depth:</span>
                <p className="mt-0.5 font-bold text-[#e2e8e4]">{depthText}</p>
              </div>
              <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] p-2.5">
                <span className="text-[10px] text-[#8c978f]">Towfish Altitude:</span>
                <p className="mt-0.5 font-bold text-[#e2e8e4]">{altitudeText}</p>
              </div>
            </div>
          </div>

          {/* 3. Physical Geometry & Survey Metadata */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#101622] p-3 text-center">
              <span className="block mx-auto text-[#3b7b99] mb-1 font-bold">╌</span>
              <span className="text-[10px] font-mono text-[#8c978f]">Acoustic Length</span>
              <p className="font-mono text-sm font-bold text-[#e2e8e4]">{lengthText}</p>
            </div>
            <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#101622] p-3 text-center">
              <span className="block mx-auto text-[#3b7b99] mb-1 font-bold">╌</span>
              <span className="text-[10px] font-mono text-[#8c978f]">Acoustic Width</span>
              <p className="font-mono text-sm font-bold text-[#e2e8e4]">{widthText}</p>
            </div>
            <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#101622] p-3 text-center">
              <svg className="mx-auto h-4 w-4 text-[#3b7b99] mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
              <span className="text-[10px] font-mono text-[#8c978f]">Footprint Area</span>
              <p className="font-mono text-sm font-bold text-[#e2e8e4]">{areaText}</p>
            </div>
          </div>

          {/* 4. Survey Origin */}
          <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#101622] p-4 text-xs space-y-1.5 overflow-hidden">
            <div className="flex justify-between items-center gap-2">
              <span className="text-[#8c978f] shrink-0">Maritime Zone:</span>
              <span className="font-semibold text-[#e2e8e4] truncate">{liveAnomaly.zone}</span>
            </div>
            <div className="flex justify-between items-center gap-2 overflow-hidden">
              <span className="text-[#8c978f] shrink-0">Survey Session:</span>
              <span className="font-mono text-[#3b7b99] truncate break-all min-w-0 text-right">{liveAnomaly.surveyName}</span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-[#8c978f] shrink-0">Detected Timestamp:</span>
              <span className="font-mono text-[#e2e8e4] truncate">{new Date(liveAnomaly.timestamp).toLocaleString()}</span>
            </div>
          </div>

          {/* 5. Review & Incident Response Actions */}
          <div className="space-y-3 rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#101622] p-4">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#e2e8e4]">
              Operations Workflow &amp; Tasking
            </h4>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8c978f]">Current Status:</span>
              <StatusChip status={liveAnomaly.status} />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 sm:grid-cols-4">
              <button
                onClick={() => handleStatusChange('verified')}
                className="flex items-center justify-center gap-1.5 rounded-sm border border-[#5b937c]/40 bg-[#5b937c]/10 py-2 text-xs font-semibold text-[#5b937c] hover:bg-[#5b937c]/20"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg> Verify
              </button>
              <button
                onClick={() => handleStatusChange('under_review')}
                className="flex items-center justify-center gap-1.5 rounded-sm border border-[#d99b26]/40 bg-[#d99b26]/10 py-2 text-xs font-semibold text-[#d99b26] hover:bg-[#d99b26]/20"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg> Flag Review
              </button>
              <button
                onClick={() => handleStatusChange('dispatched')}
                className="flex items-center justify-center gap-1.5 rounded-sm border border-[#3b7b99]/40 bg-[#3b7b99]/10 py-2 text-xs font-semibold text-[#3b7b99] hover:bg-[#3b7b99]/20"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.486 12 59.768 59.768 0 0 1 3.27 20.875L6 12zm0 0h7.5" /></svg> Dispatch
              </button>
              <button
                onClick={() => handleStatusChange('cleared')}
                className="flex items-center justify-center gap-1.5 rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#161e2e] py-2 text-xs font-semibold text-[#8c978f] hover:bg-[#101622]"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg> Clear
              </button>
            </div>

            {/* Analyst Notes & Rapid Assignment */}
            <div className="pt-2 space-y-2">
              <input
                type="text"
                placeholder="Assign Response Unit (e.g. Rapid Recovery Team 02)..."
                value={assignedTeam}
                onChange={(e) => setAssignedTeam(e.target.value)}
                className="w-full rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] px-3 py-2 text-xs text-[#e2e8e4] focus:border-[#3b7b99] focus:outline-none"
              />
              <textarea
                rows={2}
                placeholder="Archaeological or hazard recovery notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] p-3 text-xs text-[#e2e8e4] focus:border-[#3b7b99] focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveNotes}
                  className="rounded-sm bg-[#3b7b99]/20 border border-[#3b7b99]/40 px-3.5 py-1.5 text-xs font-bold text-[#3b7b99] hover:bg-[#3b7b99]/30"
                >
                  {isSaving ? 'Updating...' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>

          {/* 6. Jump to Map Action */}
          <div className="pt-2">
            {hasCoords ? (
              <Link
                href={`/map?anomalyId=${liveAnomaly.id}&lat=${liveAnomaly.latitude}&lng=${liveAnomaly.longitude}`}
                onClick={onClose}
                className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#3b7b99] py-3 text-xs font-bold text-[#e2e8e4] hover:bg-[#3b7b99]/80"
              >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={10}/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg> Focus Geotagged Target on Live Map
                <span className="font-bold">↗</span>
              </Link>
            ) : (
              <div className="flex w-full items-center justify-center gap-2 rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#101622] py-3 text-xs font-bold text-[#8c978f]">
                Target is not geotagged yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
