'use client';

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { demoStore, useDemoStore } from '@/lib/demo';
import { Survey } from '@/lib/demo/types';

const ACCEPTED_EXTENSIONS = ['.xtf', '.jsf', '.s7k'];

export default function IngestionPage() {
  const { surveys } = useDemoStore();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState<string>('idle');
  const [stageLogs, setStageLogs] = useState<string[]>([]);
  const [completedSurvey, setCompletedSurvey] = useState<Survey | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startPipelineRun = async (fileName: string, sizeMb: number) => {
    setIsProcessing(true);
    setCompletedSurvey(null);
    setStageLogs([
      `[00:00] Ingesting raw sonar telemetry file: ${fileName} (${sizeMb.toFixed(1)} MB)`,
      `[00:01] Parsing binary XTF/JSF ping packets & sensor headers...`,
    ]);

    try {
      // Trigger store simulation pipeline
      const srv = await demoStore.triggerManualUpload(fileName, sizeMb, 'USV Maris Drone-01');
      setCompletedSurvey(srv);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSampleSurvey = () => {
    startPipelineRun('MARIS_GULF_OF_MANNAR_SURVEY_01.xtf', 184.5);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const sizeMb = file.size / (1024 * 1024);
    startPipelineRun(file.name, sizeMb);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#e2e8e4] sm:text-3xl">
            Sonar Telemetry Ingestion Pipeline
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#8c978f]">
            Ingest raw side-scan (.XTF / .JSF) survey files through UNDROIP motion correction,
            2D-FFT filtering, YOLOv8-GLCM detection, and PostGIS sub-meter geotagging.
          </p>
        </div>

        {/* Try Sample Survey Demo Button */}
        <button
          onClick={handleSampleSurvey}
          disabled={isProcessing}
          className="flex items-center gap-2 rounded-sm bg-[#3b7b99] px-4 py-2.5 text-xs font-bold text-[#e2e8e4] hover:bg-[#3b7b99]/80 transition-colors"
        >
          <span>◆</span>
          <span>Try Sample Survey (1-Click)</span>
        </button>
      </div>

      {/* Upload Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={clsx(
          'relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-sm border border-[rgba(226,232,228,0.08)] p-8 text-center transition-all duration-200',
          isDragging
            ? 'border-[rgba(226,232,228,0.18)] bg-[#161e2e]'
            : 'bg-[#0b1018] hover:border-[rgba(226,232,228,0.18)] hover:bg-[#101622]'
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-[#101622] border border-[rgba(226,232,228,0.08)]">
          <svg className="h-7 w-7 text-[#3b7b99]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>

        <div className="mt-4">
          <p className="text-base font-bold text-[#e2e8e4]">Drag &amp; drop side-scan sonar survey file (.XTF / .JSF)</p>
          <p className="mt-1 text-xs text-[#8c978f]">or click to browse local hydrographic datasets</p>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#101622] px-3.5 py-1 font-mono text-[11px] text-[#8c978f]">
          <svg className="h-3.5 w-3.5 text-[#3b7b99]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
          <span>EdgeTech, Klein, ARIS, Tritech · Max 500 MB</span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileSelect(e.target.files[0]);
            }
          }}
        />
      </div>

      {/* Live Pipeline Execution Terminal & Status */}
      {isProcessing && (
        <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#070a0f] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[rgba(226,232,228,0.08)] pb-3">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#3b7b99] uppercase">
              <span>▸</span>
              MARIS Edge AI Telemetry Processing Stream
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs text-[#3b7b99]">
              <div className="h-3.5 w-3.5 skeleton-box rounded-sm" />
              EXECUTING PIPELINE STAGES...
            </div>
          </div>

          {/* 5 Stages Progress Indicator */}
          <div className="grid grid-cols-5 gap-2 font-mono text-[10px] text-center">
            {['1. Ingest', '2. UNDROIP Attitude', '3. Mosaicking', '4. YOLOv8-GLCM', '5. PostGIS Geotag'].map(
              (st, idx) => (
                <div
                  key={st}
                  className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#101622] p-2 font-bold text-[#3b7b99]"
                >
                  {st}
                </div>
              )
            )}
          </div>

          {/* Live Execution Logs */}
          <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] p-3 font-mono text-[11px] text-[#8c978f] space-y-1 max-h-44 overflow-y-auto">
            {stageLogs.map((l, i) => (
              <p key={i}>{l}</p>
            ))}
            <p className="text-[#3b7b99]">▶ Processing acoustic swath frequency domain tensors...</p>
          </div>
        </div>
      )}

      {/* Pipeline Completion Summary Card */}
      {completedSurvey && (
        <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#101622] p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-[#161e2e] text-[#5b937c]">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#5b937c]">
                Survey Processing Complete &amp; Indexed in PostGIS
              </h3>
              <p className="mt-1 text-xs text-[#8c978f]">
                12 acoustic hazard targets isolated (including 4 ghost nets) with sub-meter spatial coordinates.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#070a0f] p-4 font-mono text-xs sm:grid-cols-4">
                <div>
                  <span className="text-[#4d5750]">Survey Name:</span>
                  <p className="font-bold text-[#e2e8e4] mt-0.5">{completedSurvey.name}</p>
                </div>
                <div>
                  <span className="text-[#4d5750]">Swath Coverage:</span>
                  <p className="font-bold text-[#e2e8e4] mt-0.5">{completedSurvey.areaCoveredKm2} km²</p>
                </div>
                <div>
                  <span className="text-[#4d5750]">Pings Processed:</span>
                  <p className="font-bold text-[#e2e8e4] mt-0.5">{completedSurvey.totalPings}</p>
                </div>
                <div>
                  <span className="text-[#4d5750]">Anomalies Detected:</span>
                  <p className="font-bold text-[#5b937c] mt-0.5">12 Targets (4 Critical)</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href={`/map?surveyId=${completedSurvey.id}`}
                  className="flex items-center gap-2 rounded-sm bg-[#3b7b99] px-5 py-2.5 text-xs font-bold text-[#e2e8e4] hover:bg-[#3b7b99]/80"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={10}/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg> Focus Survey on PostGIS Map
                  <span>→</span>
                </Link>

                <Link
                  href="/anomalies"
                  className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] px-4 py-2.5 text-xs font-bold text-[#e2e8e4] hover:bg-[#161e2e]"
                >
                  View In Target Inventory
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Uploaded Surveys Table */}
      <div className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018]">
        <div className="flex items-center justify-between border-b border-[rgba(226,232,228,0.08)] px-6 py-4">
          <h2 className="font-mono text-xs font-bold text-[#e2e8e4] uppercase tracking-wider">
            Recent Hydrographic Survey Logs
          </h2>
          <span className="font-mono text-[11px] text-[#3b7b99]">{surveys.length} Registered Surveys</span>
        </div>

        <div className="p-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[rgba(226,232,228,0.08)] font-mono text-[10px] text-[#4d5750] uppercase">
                <th className="pb-3">Survey Name</th>
                <th className="pb-3">Vessel &amp; Sonar</th>
                <th className="pb-3">Format</th>
                <th className="pb-3">Maritime Zone</th>
                <th className="pb-3">Anomalies</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(226,232,228,0.08)]">
              {surveys.slice(0, 8).map((srv) => (
                <tr key={srv.id} className="hover:bg-[#101622] transition-colors">
                  <td className="py-3 font-mono font-bold text-[#e2e8e4]">
                    <span className="block truncate max-w-[220px] sm:max-w-[280px]" title={srv.name}>
                      {srv.name}
                    </span>
                  </td>
                  <td className="py-3 text-[#8c978f]">
                    {srv.vessel} · <span className="font-mono text-[11px] text-[#3b7b99]">{srv.sonarModel}</span>
                  </td>
                  <td className="py-3 font-mono text-[11px] text-[#4d5750]">{srv.format}</td>
                  <td className="py-3 font-semibold text-[#8c978f]">{srv.zone}</td>
                  <td className="py-3 font-mono font-bold text-[#3b7b99]">{srv.anomalyCount}</td>
                  <td className="py-3">
                    <span className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#101622] px-2 py-0.5 font-mono text-[10px] font-bold text-[#5b937c] uppercase">
                      {srv.status}
                    </span>
                  </td>
                  <td suppressHydrationWarning className="py-3 text-right font-mono text-[11px] text-[#4d5750]">
                    {new Date(srv.startDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
