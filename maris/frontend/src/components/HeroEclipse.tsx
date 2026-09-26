'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HeroEclipse() {
  const router = useRouter();
  const [utcTimestamp, setUtcTimestamp] = useState<string>('');
  const [swathPingCount, setSwathPingCount] = useState<number>(4820);
  const [selectedSensorChannel, setSelectedSensorChannel] = useState<'high' | 'low'>('high');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTimestamp(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const pingTicker = setInterval(() => {
      setSwathPingCount((prev) => prev + 1);
    }, 1200);
    return () => clearInterval(pingTicker);
  }, []);

  return (
    <section className="relative w-full min-h-[94vh] border-b border-white/[0.08] bg-[#070a0f] text-[#e2e8e4] flex flex-col justify-between overflow-hidden">
      {/* Cartographic Coordinate Graticule Overlay */}
      <div className="absolute inset-0 pointer-events-none nautical-graticule opacity-25 z-0" />

      {/* ── 1. Top Architectural Header Bar ── */}
      <header className="relative z-20 w-full border-b border-white/[0.08] bg-[#0b1018]/80 backdrop-blur-md px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Mark & Geodetic Tag */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-5 w-5 border border-[#8c978f] flex items-center justify-center bg-[#101622]">
                <div className="h-2 w-2 bg-[#e2e8e4]" />
              </div>
              <span className="font-mono-inst text-xs font-semibold tracking-[0.25em] text-[#e2e8e4] uppercase">
                MARIS
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-2 border-l border-white/[0.08] pl-4 font-mono-inst text-[11px] text-[#8c978f]">
              <span>SIH26057</span>
              <span>/</span>
              <span>HYDROGRAPHIC INTEL</span>
            </div>
          </div>

          {/* Real-time System Telemetry & Direct Navigation */}
          <div className="flex items-center gap-6 font-mono-inst text-[11px]">
            <div className="hidden md:flex items-center gap-3 text-[#8c978f]">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 bg-[#5b937c]" />
                <span>ACOUSTIC LINK: ACTIVE</span>
              </span>
              <span>|</span>
              <span className="tabular-nums text-[#e2e8e4]">{utcTimestamp || '2026-09-26 00:00:00 UTC'}</span>
            </div>

            <button
              type="button"
              onClick={() => router.push('/login')}
              className="border border-white/20 bg-[#101622] px-3.5 py-1.5 font-mono-inst text-xs font-medium text-[#e2e8e4] transition-colors hover:border-white/50 hover:bg-[#161e2e]"
            >
              LAUNCH CONSOLE [C2]
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. Hero Narrative & Hydrographic Data Sheet ── */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-8 py-12 md:py-16 grid lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Authoritative Editorial Header (Newsreader Serif) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 border border-white/[0.12] bg-[#101622]/85 px-2.5 py-1 font-mono-inst text-[10px] uppercase tracking-widest text-[#8c978f]">
            <span>SYSTEM SPECIFICATION</span>
            <span>:</span>
            <span className="text-[#e2e8e4]">AUTONOMOUS ACOUSTIC MOSAICKING</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl font-normal leading-[1.08] text-[#e2e8e4] tracking-tight">
            Subsea anomaly recognition and geodetic geotagging for hydrographic interdiction.
          </h1>

          <p className="text-base sm:text-lg text-[#8c978f] leading-relaxed max-w-2xl">
            Real-time multi-channel acoustic backscatter analysis, 6-axis attitude motion correction, and sub-meter PostGIS spatial mapping engineered for autonomous underwater vehicles.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 font-mono-inst text-xs">
            <button
              type="button"
              onClick={() => router.push('/map')}
              className="border border-[#e2e8e4] bg-[#e2e8e4] text-[#070a0f] px-5 py-2.5 font-semibold transition-colors hover:bg-transparent hover:text-[#e2e8e4]"
            >
              ACCESS POSTGIS SWATH MAP
            </button>

            <button
              type="button"
              onClick={() => router.push('/upload')}
              className="border border-white/20 bg-[#101622]/80 text-[#e2e8e4] px-5 py-2.5 transition-colors hover:border-white/50 hover:bg-[#161e2e]"
            >
              INGEST RAW SONAR [.XTF / .JSF]
            </button>
          </div>

          {/* Operational Verification Highlights */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/[0.08] font-mono-inst text-[11px]">
            <div>
              <div className="text-[#8c978f] text-[10px] uppercase tracking-wider">POSITION PRECISION</div>
              <div className="font-semibold text-[#e2e8e4] text-sm tabular-nums mt-0.5">±0.38 METER</div>
            </div>
            <div>
              <div className="text-[#8c978f] text-[10px] uppercase tracking-wider">EDGE INFERENCE</div>
              <div className="font-semibold text-[#e2e8e4] text-sm tabular-nums mt-0.5">14.2 MS / TILE</div>
            </div>
            <div>
              <div className="text-[#8c978f] text-[10px] uppercase tracking-wider">GEODETIC CRS</div>
              <div className="font-semibold text-[#5b937c] text-sm mt-0.5">EPSG:4326 WGS84</div>
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Hydrographic Signal Workbench */}
        <div className="lg:col-span-5 border border-white/[0.12] bg-[#0b1018]/85 backdrop-blur-sm p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-[#d93829]" />
              <span className="font-mono-inst text-xs font-semibold text-[#e2e8e4] uppercase tracking-wider">
                LIVE SENSOR TELEMETRY BENCH
              </span>
            </div>
            <div className="flex items-center gap-1 font-mono-inst text-[10px]">
              <button
                type="button"
                onClick={() => setSelectedSensorChannel('high')}
                className={`px-2 py-0.5 border ${
                  selectedSensorChannel === 'high'
                    ? 'border-white/40 bg-white/10 text-[#e2e8e4]'
                    : 'border-transparent text-[#8c978f]'
                }`}
              >
                900 kHz SSS
              </button>
              <button
                type="button"
                onClick={() => setSelectedSensorChannel('low')}
                className={`px-2 py-0.5 border ${
                  selectedSensorChannel === 'low'
                    ? 'border-white/40 bg-white/10 text-[#e2e8e4]'
                    : 'border-transparent text-[#8c978f]'
                }`}
              >
                450 kHz MBES
              </button>
            </div>
          </div>

          {/* Sonar Waterfall Signal Raster Sim */}
          <div className="relative h-44 w-full border border-white/[0.08] bg-[#040609]/90 overflow-hidden flex flex-col justify-between p-3 font-mono-inst text-[10px]">
            <div className="flex justify-between text-[#8c978f]">
              <span>PORT SWATH : 75M</span>
              <span className="text-[#5b937c]">NADIR ZERO</span>
              <span>STARBOARD SWATH : 75M</span>
            </div>

            {/* Simulated Acoustic Scan Raster Lines */}
            <div className="space-y-1.5 opacity-60">
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="h-[1px] w-3/4 mx-auto bg-gradient-to-r from-transparent via-[#5b937c]/40 to-transparent" />
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="h-[1px] w-5/6 mx-auto bg-gradient-to-r from-transparent via-[#d93829]/50 to-transparent" />
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#8c978f]">PING COUNTER: <span className="text-[#e2e8e4] tabular-nums font-semibold">{swathPingCount}</span></span>
              <span className="text-[#d93829] font-semibold">[TARGET DETECTED: UXO-04]</span>
            </div>
          </div>

          {/* Real Target Metadata Inspection Block */}
          <div className="grid grid-cols-2 gap-2 font-mono-inst text-[10px]">
            <div className="border border-white/[0.06] bg-[#101622] p-2">
              <span className="text-[#8c978f] block">LATITUDE COORDINATE</span>
              <span className="text-[#e2e8e4] font-semibold tabular-nums">13.0827° N</span>
            </div>
            <div className="border border-white/[0.06] bg-[#101622] p-2">
              <span className="text-[#8c978f] block">LONGITUDE COORDINATE</span>
              <span className="text-[#e2e8e4] font-semibold tabular-nums">80.2707° E</span>
            </div>
            <div className="border border-white/[0.06] bg-[#101622] p-2">
              <span className="text-[#8c978f] block">CLASSIFICATION TAXONOMY</span>
              <span className="text-[#d93829] font-semibold">DERELICT GHOST NET</span>
            </div>
            <div className="border border-white/[0.06] bg-[#101622] p-2">
              <span className="text-[#8c978f] block">MODEL CONFIDENCE</span>
              <span className="text-[#5b937c] font-semibold tabular-nums">96.8% (mAP50)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Bottom Geodetic Scale & Sector Status Bar ── */}
      <div className="relative z-20 w-full border-t border-white/[0.08] bg-[#0b1018] px-4 sm:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 font-mono-inst text-[11px] text-[#8c978f]">
          <div className="flex items-center gap-4">
            <span className="text-[#e2e8e4]">OPERATIONAL THEATER:</span>
            <span>BAY OF BENGAL / GULF OF MANNAR</span>
          </div>
          <div className="flex items-center gap-6">
            <span>SURVEY LINES: 24 ACTIVE</span>
            <span>INTERDICTION READY: YES</span>
            <span className="text-[#5b937c]">SRID: 4326</span>
          </div>
        </div>
      </div>
    </section>
  );
}
