'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  Upload,
  FileCheck,
  AlertCircle,
  Loader2,
  FileText,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Layers,
  Sparkles,
  Terminal,
  Activity,
  Compass,
} from 'lucide-react';
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
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Sonar Telemetry Ingestion Pipeline
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">
            Ingest raw side-scan (.XTF / .JSF) survey files through UNDROIP motion correction,
            2D-FFT filtering, YOLOv8-GLCM detection, and PostGIS sub-meter geotagging.
          </p>
        </div>

        {/* Try Sample Survey Demo Button */}
        <button
          onClick={handleSampleSurvey}
          disabled={isProcessing}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 px-4 py-2.5 text-xs font-bold text-black shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform"
        >
          <Sparkles className="h-4 w-4" />
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
          'relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200',
          isDragging
            ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
            : 'border-[var(--color-border)] bg-[#0d1627]/80 hover:border-cyan-400/50 hover:bg-[#121d33]'
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#060a12] border border-[var(--color-border)]">
          <Upload className="h-7 w-7 text-cyan-400" />
        </div>

        <div className="mt-4">
          <p className="text-base font-bold text-white">Drag &amp; drop side-scan sonar survey file (.XTF / .JSF)</p>
          <p className="mt-1 text-xs text-slate-400">or click to browse local hydrographic datasets</p>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[#060a12] px-3.5 py-1 font-mono text-[11px] text-slate-300">
          <Layers className="h-3.5 w-3.5 text-cyan-400" />
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
        <div className="rounded-xl border border-cyan-500/40 bg-[#070b14] p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-300 uppercase">
              <Terminal className="h-4 w-4 text-cyan-400" />
              MARIS Edge AI Telemetry Processing Stream
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs text-cyan-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              EXECUTING PIPELINE STAGES...
            </div>
          </div>

          {/* 5 Stages Progress Indicator */}
          <div className="grid grid-cols-5 gap-2 font-mono text-[10px] text-center">
            {['1. Ingest', '2. UNDROIP Attitude', '3. Mosaicking', '4. YOLOv8-GLCM', '5. PostGIS Geotag'].map(
              (st, idx) => (
                <div
                  key={st}
                  className="rounded-lg border border-cyan-500/30 bg-cyan-950/40 p-2 font-bold text-cyan-300 animate-pulse"
                >
                  {st}
                </div>
              )
            )}
          </div>

          {/* Live Execution Logs */}
          <div className="rounded-lg border border-slate-800 bg-[#04070d] p-3 font-mono text-[11px] text-emerald-400 space-y-1 max-h-44 overflow-y-auto">
            {stageLogs.map((l, i) => (
              <p key={i}>{l}</p>
            ))}
            <p className="text-cyan-400 animate-pulse">▶ Processing acoustic swath frequency domain tensors...</p>
          </div>
        </div>
      )}

      {/* Pipeline Completion Summary Card */}
      {completedSurvey && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-6 shadow-2xl backdrop-blur-xl space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-emerald-300">
                Survey Processing Complete &amp; Indexed in PostGIS
              </h3>
              <p className="mt-1 text-xs text-slate-300">
                12 acoustic hazard targets isolated (including 4 ghost nets) with sub-meter spatial coordinates.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-emerald-500/20 bg-black/40 p-4 font-mono text-xs sm:grid-cols-4">
                <div>
                  <span className="text-slate-400">Survey Name:</span>
                  <p className="font-bold text-white mt-0.5">{completedSurvey.name}</p>
                </div>
                <div>
                  <span className="text-slate-400">Swath Coverage:</span>
                  <p className="font-bold text-white mt-0.5">{completedSurvey.areaCoveredKm2} km²</p>
                </div>
                <div>
                  <span className="text-slate-400">Pings Processed:</span>
                  <p className="font-bold text-white mt-0.5">{completedSurvey.totalPings}</p>
                </div>
                <div>
                  <span className="text-slate-400">Anomalies Detected:</span>
                  <p className="font-bold text-emerald-400 mt-0.5">12 Targets (4 Critical)</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href={`/map?surveyId=${completedSurvey.id}`}
                  className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-xs font-bold text-black shadow-lg hover:bg-cyan-300"
                >
                  <Compass className="h-4 w-4" /> Focus Survey on PostGIS Map
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/anomalies"
                  className="rounded-xl border border-[var(--color-border)] bg-[#0d1627] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#121d33]"
                >
                  View In Target Inventory
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Uploaded Surveys Table */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[#0d1627]/90 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
          <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
            Recent Hydrographic Survey Logs
          </h2>
          <span className="font-mono text-[11px] text-cyan-400">{surveys.length} Registered Surveys</span>
        </div>

        <div className="p-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border)] font-mono text-[10px] text-slate-400 uppercase">
                <th className="pb-3">Survey Name</th>
                <th className="pb-3">Vessel &amp; Sonar</th>
                <th className="pb-3">Format</th>
                <th className="pb-3">Maritime Zone</th>
                <th className="pb-3">Anomalies</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {surveys.slice(0, 8).map((srv) => (
                <tr key={srv.id} className="hover:bg-[#121d33] transition-colors">
                  <td className="py-3 font-mono font-bold text-white">
                    {srv.name}
                  </td>
                  <td className="py-3 text-slate-300">
                    {srv.vessel} · <span className="font-mono text-[11px] text-cyan-300">{srv.sonarModel}</span>
                  </td>
                  <td className="py-3 font-mono text-[11px] text-slate-400">{srv.format}</td>
                  <td className="py-3 font-semibold text-slate-300">{srv.zone}</td>
                  <td className="py-3 font-mono font-bold text-cyan-400">{srv.anomalyCount}</td>
                  <td className="py-3">
                    <span className="rounded-md border border-emerald-500/40 bg-emerald-950/40 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300 uppercase">
                      {srv.status}
                    </span>
                  </td>
                  <td suppressHydrationWarning className="py-3 text-right font-mono text-[11px] text-slate-400">
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
