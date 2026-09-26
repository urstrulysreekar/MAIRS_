'use client';

import React, { useState, useMemo } from 'react';
import { useDemoStore } from '@/lib/demo';
import { HazardBadge, SeverityPill, StatusChip } from '@/components/ui/Badge';
import SonarThumbnail from '@/components/ui/SonarThumbnail';
import {
  Printer,
  FileText,
  Shield,
  Download,
  CheckCircle2,
  Compass,
  Layers,
  Sparkles,
  Calendar,
  Waves,
} from 'lucide-react';

export default function ReportsPage() {
  const { surveys, anomalies } = useDemoStore();
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>(
    surveys[0]?.id || ''
  );

  const currentSurvey = useMemo(() => {
    return surveys.find((s) => s.id === selectedSurveyId) || surveys[0];
  }, [surveys, selectedSurveyId]);

  const surveyAnomalies = useMemo(() => {
    if (!currentSurvey) return [];
    return anomalies.filter((a) => a.surveyId === currentSurvey.id);
  }, [anomalies, currentSurvey]);

  const ghostNetsCount = surveyAnomalies.filter(
    (a) => a.hazardClass === 'ghost_net'
  ).length;

  const handlePrint = () => {
    window.print();
  };

  if (!currentSurvey) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      {/* Top Controls Bar (hidden during print) */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[#0d1627]/90 p-4 shadow-xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-cyan-400" />
          <div>
            <h2 className="font-mono text-xs font-bold uppercase text-white">
              Executive Survey Report Generator
            </h2>
            <p className="text-[11px] text-slate-400">
              Select survey mission log to render printable hydrographic intelligence dossier.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedSurveyId}
            onChange={(e) => setSelectedSurveyId(e.target.value)}
            className="rounded-xl border border-[var(--color-border)] bg-[#060a12] px-3 py-2 text-xs font-bold text-cyan-300 focus:outline-none"
          >
            {surveys.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.zone})
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-xs font-bold text-black shadow-lg hover:bg-cyan-300"
          >
            <Printer className="h-4 w-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* ── Printable Report Document Container ── */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[#0d1627] p-8 shadow-2xl space-y-8 print:border-none print:bg-white print:text-black print:p-0">
        {/* Report Official Header */}
        <div className="flex items-start justify-between border-b border-[var(--color-border)] pb-6 print:border-black">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 print:text-black">
              <Shield className="h-6 w-6" />
              <span className="font-mono text-sm font-black tracking-widest uppercase">
                MARIS · SIH26057 HYDROGRAPHIC INTELLIGENCE
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-black text-white print:text-black">
              Side-Scan Sonar Telemetry &amp; Anomaly Assessment Dossier
            </h1>
            <p className="font-mono text-xs text-slate-400 print:text-gray-700">
              REPORT REF: MARIS-SURVEY-DOC-{currentSurvey.id.toUpperCase()} · CLASSIFICATION: OFFICIAL DEMO
            </p>
          </div>

          <div className="text-right font-mono text-xs text-slate-400 print:text-gray-700">
            <p suppressHydrationWarning>Generated: {new Date().toUTCString()}</p>
            <p className="text-emerald-400 print:text-green-800 font-bold">STATUS: VERIFIED GROUND TRUTH</p>
          </div>
        </div>

        {/* Executive Summary Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 font-mono text-xs">
          <div className="rounded-xl border border-[var(--color-border)] bg-[#070b14] p-4 print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] text-slate-400 print:text-gray-600 block">SURVEY LOG</span>
            <p className="mt-1 font-bold text-white print:text-black text-sm">{currentSurvey.name}</p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[#070b14] p-4 print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] text-slate-400 print:text-gray-600 block">VESSEL &amp; SENSOR</span>
            <p className="mt-1 font-bold text-white print:text-black text-sm">
              {currentSurvey.vessel} ({currentSurvey.sonarModel})
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[#070b14] p-4 print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] text-slate-400 print:text-gray-600 block">SEABED SWATH AREA</span>
            <p className="mt-1 font-bold text-cyan-400 print:text-black text-sm">
              {currentSurvey.areaCoveredKm2} km² ({currentSurvey.swathWidthM}m Swath)
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[#070b14] p-4 print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] text-slate-400 print:text-gray-600 block">HAZARDS ISOLATED</span>
            <p className="mt-1 font-bold text-rose-400 print:text-black text-sm">
              {surveyAnomalies.length} Targets ({ghostNetsCount} Ghost Nets)
            </p>
          </div>
        </div>

        {/* Survey Coordinates & Transect */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[#070b14] p-5 space-y-2 print:border-gray-300 print:bg-gray-50">
          <h3 className="font-mono text-xs font-bold uppercase text-cyan-300 print:text-black">
            Transect Navigation &amp; PostGIS Geotagging Bounds
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs text-slate-300 print:text-black">
            <div>
              <span className="text-[10px] text-slate-500">Center Lat:</span>
              <p className="font-bold">{currentSurvey.centerLat}° N</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500">Center Lon:</span>
              <p className="font-bold">{currentSurvey.centerLng}° E</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500">Pings Recorded:</span>
              <p className="font-bold">{currentSurvey.totalPings}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500">Acoustic Frequency:</span>
              <p className="font-bold">{currentSurvey.frequencyKhz} kHz</p>
            </div>
          </div>
        </div>

        {/* Top Critical Isolated Anomalies */}
        <div className="space-y-4">
          <h3 className="font-mono text-sm font-bold text-white uppercase print:text-black">
            Identified Underwater Anomaly Inventory ({surveyAnomalies.length} Detections)
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {surveyAnomalies.slice(0, 6).map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-[var(--color-border)] bg-[#070b14] p-4 space-y-3 print:border-gray-300 print:bg-white"
              >
                <div className="flex items-center justify-between">
                  <HazardBadge hazardClass={a.hazardClass} size="sm" />
                  <SeverityPill severity={a.severity} />
                </div>

                <p className="text-xs font-bold text-white print:text-black">{a.label}</p>

                <SonarThumbnail
                  hazardClass={a.hazardClass}
                  seed={a.snippetSeed}
                  height={120}
                  className="print:border-gray-300"
                />

                <div className="grid grid-cols-2 gap-2 font-mono text-[10px] text-slate-400 print:text-gray-700">
                  <div>
                    <span>Coords:</span>
                    <p className="text-white print:text-black font-bold">
                      {a.latitude.toFixed(4)}°N, {a.longitude.toFixed(4)}°E
                    </p>
                  </div>
                  <div>
                    <span>Depth / Altitude:</span>
                    <p className="text-white print:text-black font-bold">
                      {a.depthM}m / {a.altitudeM}m
                    </p>
                  </div>
                  <div>
                    <span>Confidence:</span>
                    <p className="text-emerald-400 print:text-green-800 font-bold">
                      {(a.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <span>Dimensions:</span>
                    <p className="text-white print:text-black font-bold">
                      {a.lengthM}m × {a.widthM}m
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Official Signoff Block */}
        <div className="border-t border-[var(--color-border)] pt-6 flex justify-between font-mono text-xs text-slate-400 print:text-gray-600 print:border-black">
          <div>
            <p className="font-bold text-white print:text-black">Lead Hydrographer Verification</p>
            <p className="text-[10px]">MARIS Autonomous Edge Telemetry Subsystem</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-cyan-400 print:text-black">SIH26057 Evaluation Ready</p>
            <p className="text-[10px]">National Marine Operations Protocol</p>
          </div>
        </div>
      </div>
    </div>
  );
}
