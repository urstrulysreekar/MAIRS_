'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Anomaly, ReviewStatus } from '@/lib/demo/types';
import { demoStore } from '@/lib/demo/store';
import { useDemoStore } from '@/lib/demo';
import SonarThumbnail from './SonarThumbnail';
import { HazardBadge, SeverityPill, StatusChip } from './Badge';
import {
  X,
  MapPin,
  Compass,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Send,
  ExternalLink,
  ShieldCheck,
  FileText,
  Clock,
  Waves,
  Ruler,
} from 'lucide-react';
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
    <div className="fixed inset-0 z-[9999] flex justify-end bg-black/60 backdrop-blur-sm">
      {/* Backdrop overlay */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide-out Panel */}
      <div className="relative flex h-full w-full max-w-xl flex-col border-l border-[var(--color-border)] bg-[#0a1120] p-6 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--color-border)] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <HazardBadge hazardClass={liveAnomaly.hazardClass} size="md" />
              <SeverityPill severity={liveAnomaly.severity} />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">{liveAnomaly.label}</h2>
            <p className="font-mono text-xs text-[var(--color-text-muted)]">
              ANOMALY ID: <span className="text-cyan-400 font-bold">{liveAnomaly.id}</span> · PING #{liveAnomaly.pingIndex}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--color-border)] p-1.5 text-slate-400 hover:bg-[#121d33] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-6">
          {/* 1. Procedural Sonar Acoustic Waterfall View */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Acoustic Waterfall Backscatter Tile
              </span>
              <span className="font-mono text-[11px] font-semibold text-emerald-400">
                Confidence: {(liveAnomaly.confidence * 100).toFixed(1)}%
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
          <div className="rounded-xl border border-[var(--color-border)] bg-[#0d1627] p-4">
            <h3 className="mb-3 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
              <Compass className="h-4 w-4" /> PostGIS Sub-Meter Coordinates
            </h3>
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[#070b14] p-2.5">
                <span className="text-[10px] text-slate-400">Latitude (WGS84):</span>
                <p className="mt-0.5 font-bold text-white">{liveAnomaly.latitude.toFixed(5)}° N</p>
              </div>
              <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[#070b14] p-2.5">
                <span className="text-[10px] text-slate-400">Longitude (WGS84):</span>
                <p className="mt-0.5 font-bold text-white">{liveAnomaly.longitude.toFixed(5)}° E</p>
              </div>
              <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[#070b14] p-2.5">
                <span className="text-[10px] text-slate-400">Bathymetric Depth:</span>
                <p className="mt-0.5 font-bold text-white">{liveAnomaly.depthM.toFixed(1)} m</p>
              </div>
              <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[#070b14] p-2.5">
                <span className="text-[10px] text-slate-400">Towfish Altitude:</span>
                <p className="mt-0.5 font-bold text-white">{liveAnomaly.altitudeM.toFixed(1)} m</p>
              </div>
            </div>
          </div>

          {/* 3. Physical Geometry & Survey Metadata */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-[var(--color-border)] bg-[#0d1627] p-3 text-center">
              <Ruler className="mx-auto h-4 w-4 text-cyan-400 mb-1" />
              <span className="text-[10px] font-mono text-slate-400">Acoustic Length</span>
              <p className="font-mono text-sm font-bold text-white">{liveAnomaly.lengthM} m</p>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-[#0d1627] p-3 text-center">
              <Ruler className="mx-auto h-4 w-4 text-cyan-400 mb-1" />
              <span className="text-[10px] font-mono text-slate-400">Acoustic Width</span>
              <p className="font-mono text-sm font-bold text-white">{liveAnomaly.widthM} m</p>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-[#0d1627] p-3 text-center">
              <Layers className="mx-auto h-4 w-4 text-cyan-400 mb-1" />
              <span className="text-[10px] font-mono text-slate-400">Footprint Area</span>
              <p className="font-mono text-sm font-bold text-white">{liveAnomaly.areaM2} m²</p>
            </div>
          </div>

          {/* 4. Survey Origin */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[#0d1627] p-4 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Maritime Zone:</span>
              <span className="font-semibold text-white">{liveAnomaly.zone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Survey Session:</span>
              <span className="font-mono text-cyan-300">{liveAnomaly.surveyName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Detected Timestamp:</span>
              <span className="font-mono text-slate-300">{new Date(liveAnomaly.timestamp).toLocaleString()}</span>
            </div>
          </div>

          {/* 5. Review & Incident Response Actions */}
          <div className="space-y-3 rounded-xl border border-[var(--color-border)] bg-[#0d1627] p-4">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
              Operations Workflow &amp; Tasking
            </h4>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Current Status:</span>
              <StatusChip status={liveAnomaly.status} />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 sm:grid-cols-4">
              <button
                onClick={() => handleStatusChange('verified')}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Verify
              </button>
              <button
                onClick={() => handleStatusChange('under_review')}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-950/40 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-900/50"
              >
                <Clock className="h-3.5 w-3.5" /> Flag Review
              </button>
              <button
                onClick={() => handleStatusChange('dispatched')}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-950/40 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-900/50"
              >
                <Send className="h-3.5 w-3.5" /> Dispatch
              </button>
              <button
                onClick={() => handleStatusChange('cleared')}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Clear
              </button>
            </div>

            {/* Analyst Notes & Rapid Assignment */}
            <div className="pt-2 space-y-2">
              <input
                type="text"
                placeholder="Assign Response Unit (e.g. Rapid Recovery Team 02)..."
                value={assignedTeam}
                onChange={(e) => setAssignedTeam(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[#070b14] px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
              <textarea
                rows={2}
                placeholder="Archaeological or hazard recovery notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[#070b14] p-3 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveNotes}
                  className="rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-3.5 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/30"
                >
                  {isSaving ? 'Updating...' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>

          {/* 6. Jump to Map Action */}
          <div className="pt-2">
            <Link
              href={`/map?anomalyId=${liveAnomaly.id}&lat=${liveAnomaly.latitude}&lng=${liveAnomaly.longitude}`}
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] py-3 text-xs font-bold text-black shadow-lg shadow-cyan-500/20 hover:bg-cyan-300"
            >
              <Compass className="h-4 w-4" /> Focus Geotagged Target on Live Map
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
