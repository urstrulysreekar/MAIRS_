'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFilteredAnomalies } from '@/lib/demo';
import SonarThumbnail from '@/components/ui/SonarThumbnail';
import { IS_DEMO_MODE } from '@/lib/app-mode';

export default function Scene2SplitFeature() {
  const router = useRouter();
  const { anomalies } = useFilteredAnomalies();
  const topCandidate = anomalies[0] ?? {
    id: 'no-live-detections',
    label: 'No live detections recorded',
    confidence: null,
    depthM: null,
    latitude: null,
    longitude: null,
    hazardClass: 'unknown' as const,
    snippetSeed: 0,
  };

  const [elapsedMs, setElapsedMs] = useState(18.4);

  useEffect(() => {
    if (!IS_DEMO_MODE) return;
    const timer = setInterval(() => {
      setElapsedMs((prev) => +(18.2 + Math.random() * 0.5).toFixed(1));
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="split-feature" className="relative min-h-screen py-24 px-4 sm:px-8 max-w-7xl mx-auto flex items-center justify-center text-[#EDEBFF]">
      <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">
        {/* Left Column: Three-Word Stacked Headline ("Detect. / Locate. / Prove.") */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0A0A2C]/60 px-3 py-1 font-mono-inst text-[10px] uppercase tracking-widest text-[#C7B6FF]">
            <span>EDGE ACOUSTIC INFERENCE</span>
          </div>

          <h2 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.05] uppercase text-[#EDEBFF]">
            Detect. <br />
            Locate. <br />
            Prove.
          </h2>

          <p className="text-sm sm:text-base text-[rgba(200,196,255,0.7)] leading-relaxed max-w-xl">
            Autonomous multi-frequency acoustic backscatter decomposition. Operating locally at the seabed edge with sub-meter spatial accuracy, 6-axis attitude compensation, and instant cryptographic evidence generation.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => router.push('/console')}
              className="rounded-full bg-[#F3F2FA] text-[#040313] px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-white hover:shadow-[0_0_20px_rgba(243,242,250,0.5)] transition-all cursor-pointer"
            >
              Open console
            </button>
          </div>
        </div>

        {/* Right Column: Phone Mockup with Live Timer, Real Sonar Frame & Violet Bottom Glow */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-72 sm:w-80 rounded-[2.5rem] border border-white/20 bg-[#0A0A2C]/80 backdrop-blur-2xl p-4 shadow-[0_25px_60px_rgba(4,3,19,0.8)] overflow-hidden">
            {/* Top Speaker & Dynamic Island Notch */}
            <div className="flex justify-center mb-3">
              <div className="h-4 w-28 rounded-full bg-[#040313] border border-white/10 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-[#7B3DFF]" />
              </div>
            </div>

            {/* Inner Phone Screen */}
            <div className="rounded-[1.8rem] border border-white/10 bg-[#040313] p-3.5 space-y-3 relative overflow-hidden font-mono-inst text-xs">
              {/* Header Telemetry */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[10px]">
                <span className="text-[#C7B6FF]">SENSOR DATA</span>
                <span className="text-[#5b937c] font-bold">{IS_DEMO_MODE ? 'LIVE STREAM' : 'DATABASE RECORD'}</span>
              </div>

              {/* Real Sonar Waterfall Frame */}
              <div className="relative rounded-lg border border-white/10 overflow-hidden bg-[#0A0A2C]/50">
                {IS_DEMO_MODE && topCandidate.id !== 'no-live-detections' ? (
                  <SonarThumbnail
                    hazardClass={topCandidate.hazardClass}
                    seed={topCandidate.snippetSeed}
                    height={150}
                    className="w-full"
                  />
                ) : (
                  <div className="flex h-[150px] items-center justify-center font-mono text-[10px] text-[#8c978f]">
                    {topCandidate.id === 'no-live-detections' ? 'NO LIVE DETECTIONS' : 'RAW SONAR TILE NOT STORED'}
                  </div>
                )}
                <div className="absolute top-2 left-2 rounded bg-[#040313]/80 px-2 py-0.5 text-[9px] text-[#C7B6FF] border border-white/10">
                  TOP CANDIDATE: {topCandidate.id}
                </div>
              </div>

              {/* Real Candidate Data & Live Latency */}
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[rgba(200,196,255,0.6)]">CLASSIFICATION:</span>
                  <span className="font-bold text-[#EDEBFF] uppercase truncate max-w-[140px]">{topCandidate.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[rgba(200,196,255,0.6)]">CONFIDENCE:</span>
                  <span className="text-[#5b937c] font-bold">
                    {topCandidate.confidence == null ? 'Not recorded' : `${(topCandidate.confidence * 100).toFixed(1)}%`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[rgba(200,196,255,0.6)]">EDGE LATENCY:</span>
                  <span className="text-[#C7B6FF] font-bold tabular-nums">
                    {IS_DEMO_MODE ? `${elapsedMs} ms` : 'Not recorded'}
                  </span>
                </div>
              </div>

              {/* Violet Bottom Glow Gradient & Rising Globe Cue */}
              <div className="absolute -bottom-10 left-0 right-0 h-24 bg-gradient-to-t from-[#7B3DFF]/50 via-[#7B3DFF]/20 to-transparent pointer-events-none rounded-b-[1.8rem]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
