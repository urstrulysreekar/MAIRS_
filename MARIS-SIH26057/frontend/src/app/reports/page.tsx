'use client';

import React, { useState, useMemo } from 'react';
import { useDemoStore } from '@/lib/demo';
import { HazardBadge, SeverityPill, StatusChip } from '@/components/ui/Badge';
import SonarThumbnail from '@/components/ui/SonarThumbnail';

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
      <div className="flex flex-col gap-3 rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] p-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 text-[#3b7b99]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          <div>
            <h2 className="font-mono text-xs font-bold uppercase text-[#e2e8e4]">
              Executive Survey Report Generator
            </h2>
            <p className="text-[11px] text-[#8c978f]">
              Select survey mission log to render printable hydrographic intelligence dossier.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedSurveyId}
            onChange={(e) => setSelectedSurveyId(e.target.value)}
            className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#101622] px-3 py-2 text-xs font-bold text-[#3b7b99] focus:outline-none"
          >
            {surveys.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.zone})
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-sm bg-[#3b7b99] px-4 py-2 text-xs font-bold text-[#e2e8e4] hover:bg-[#3b7b99]/80"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* ── Printable Report Document Container ── */}
      <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] p-8 space-y-8 print:border-none print:bg-white print:text-black print:p-0">
        {/* Report Official Header */}
        <div className="flex items-start justify-between border-b border-[rgba(226,232,228,0.08)] pb-6 print:border-black">
          <div>
            <div className="flex items-center gap-2 text-[#3b7b99] print:text-black">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span className="font-mono text-sm font-black tracking-widest uppercase">
                MARIS · SIH26057 HYDROGRAPHIC INTELLIGENCE
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-black text-[#e2e8e4] print:text-black">
              Side-Scan Sonar Telemetry &amp; Anomaly Assessment Dossier
            </h1>
            <p className="font-mono text-xs text-[#8c978f] print:text-gray-700">
              REPORT REF: MARIS-SURVEY-DOC-{currentSurvey.id.toUpperCase()} · CLASSIFICATION: OFFICIAL DEMO
            </p>
          </div>

          <div className="text-right font-mono text-xs text-[#8c978f] print:text-gray-700">
            <p suppressHydrationWarning>Generated: {new Date().toUTCString()}</p>
            <p className="text-[#5b937c] print:text-green-800 font-bold">STATUS: VERIFIED GROUND TRUTH</p>
          </div>
        </div>

        {/* Executive Summary Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 font-mono text-xs overflow-hidden">
          <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#070a0f] p-4 print:border-gray-300 print:bg-gray-50 overflow-hidden">
            <span className="text-[10px] text-[#8c978f] print:text-gray-600 block truncate">SURVEY LOG</span>
            <p className="mt-1 font-bold text-[#e2e8e4] print:text-black text-sm truncate break-all">{currentSurvey.name}</p>
          </div>
          <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#070a0f] p-4 print:border-gray-300 print:bg-gray-50 overflow-hidden">
            <span className="text-[10px] text-[#8c978f] print:text-gray-600 block truncate">VESSEL &amp; SENSOR</span>
            <p className="mt-1 font-bold text-[#e2e8e4] print:text-black text-sm truncate break-all">
              {currentSurvey.vessel} ({currentSurvey.sonarModel})
            </p>
          </div>
          <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#070a0f] p-4 print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] text-[#8c978f] print:text-gray-600 block">SEABED SWATH AREA</span>
            <p className="mt-1 font-bold text-[#3b7b99] print:text-black text-sm">
              {currentSurvey.areaCoveredKm2 == null ? 'Not recorded' : `${currentSurvey.areaCoveredKm2} km²`}
              {currentSurvey.swathWidthM == null ? '' : ` (${currentSurvey.swathWidthM}m swath)`}
            </p>
          </div>
          <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#070a0f] p-4 print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] text-[#8c978f] print:text-gray-600 block">HAZARDS ISOLATED</span>
            <p className="mt-1 font-bold text-[#d93829] print:text-black text-sm">
              {surveyAnomalies.length} Targets ({ghostNetsCount} Ghost Nets)
            </p>
          </div>
        </div>

        {/* Survey Coordinates & Transect */}
        <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#070a0f] p-5 space-y-2 print:border-gray-300 print:bg-gray-50">
          <h3 className="font-mono text-xs font-bold uppercase text-[#3b7b99] print:text-black">
            Transect Navigation &amp; PostGIS Geotagging Bounds
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs text-[#8c978f] print:text-black">
            <div>
              <span className="text-[10px] text-[#4d5750]">Center Lat:</span>
              <p className="font-bold text-[#e2e8e4]">{currentSurvey.centerLat == null ? 'Not recorded' : `${currentSurvey.centerLat}° N`}</p>
            </div>
            <div>
              <span className="text-[10px] text-[#4d5750]">Center Lon:</span>
              <p className="font-bold text-[#e2e8e4]">{currentSurvey.centerLng == null ? 'Not recorded' : `${currentSurvey.centerLng}° E`}</p>
            </div>
            <div>
              <span className="text-[10px] text-[#4d5750]">Pings Recorded:</span>
              <p className="font-bold text-[#e2e8e4]">{currentSurvey.totalPings ?? 'Not recorded'}</p>
            </div>
            <div>
              <span className="text-[10px] text-[#4d5750]">Acoustic Frequency:</span>
              <p className="font-bold text-[#e2e8e4]">{currentSurvey.frequencyKhz == null ? 'Not recorded' : `${currentSurvey.frequencyKhz} kHz`}</p>
            </div>
          </div>
        </div>

        {/* Top Critical Isolated Anomalies */}
        <div className="space-y-4">
          <h3 className="font-mono text-sm font-bold text-[#e2e8e4] uppercase print:text-black">
            Identified Underwater Anomaly Inventory ({surveyAnomalies.length} Detections)
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {surveyAnomalies.slice(0, 6).map((a) => (
              <div
                key={a.id}
                className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#070a0f] p-4 space-y-3 print:border-gray-300 print:bg-white"
              >
                <div className="flex items-center justify-between">
                  <HazardBadge hazardClass={a.hazardClass} size="sm" />
                  <SeverityPill severity={a.severity} />
                </div>

                <p className="text-xs font-bold text-[#e2e8e4] print:text-black">{a.label}</p>

                <SonarThumbnail
                  hazardClass={a.hazardClass}
                  seed={a.snippetSeed}
                  height={120}
                  className="print:border-gray-300"
                />

                <div className="grid grid-cols-2 gap-2 font-mono text-[10px] text-[#8c978f] print:text-gray-700">
                  <div>
                    <span>Coords:</span>
                    <p className="text-[#e2e8e4] print:text-black font-bold">
                      {a.latitude == null || a.longitude == null
                        ? 'Not geotagged'
                        : `${a.latitude.toFixed(4)}°N, ${a.longitude.toFixed(4)}°E`}
                    </p>
                  </div>
                  <div>
                    <span>Depth / Altitude:</span>
                    <p className="text-[#e2e8e4] print:text-black font-bold">
                      {a.depthM == null ? 'Not recorded' : `${a.depthM}m`} /{' '}
                      {a.altitudeM == null ? 'Not recorded' : `${a.altitudeM}m`}
                    </p>
                  </div>
                  <div>
                    <span>Confidence:</span>
                    <p className="text-[#5b937c] print:text-green-800 font-bold">
                      {a.confidence == null ? 'Not recorded' : `${(a.confidence * 100).toFixed(1)}%`}
                    </p>
                  </div>
                  <div>
                    <span>Dimensions:</span>
                    <p className="text-[#e2e8e4] print:text-black font-bold">
                      {a.lengthM == null || a.widthM == null
                        ? 'Not recorded'
                        : `${a.lengthM}m × ${a.widthM}m`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Official Signoff Block */}
        <div className="border-t border-[rgba(226,232,228,0.08)] pt-6 flex justify-between font-mono text-xs text-[#8c978f] print:text-gray-600 print:border-black">
          <div>
            <p className="font-bold text-[#e2e8e4] print:text-black">Lead Hydrographer Verification</p>
            <p className="text-[10px]">MARIS Autonomous Edge Telemetry Subsystem</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-[#3b7b99] print:text-black">SIH26057 Evaluation Ready</p>
            <p className="text-[10px]">National Marine Operations Protocol</p>
          </div>
        </div>
      </div>
    </div>
  );
}
