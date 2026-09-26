'use client';

import React, { useState } from 'react';

interface SpecRow {
  index: string;
  module: string;
  architecture: string;
  capability: string;
  benchmark: string;
  status: string;
}

const SPEC_LEDGER: SpecRow[] = [
  {
    index: '01',
    module: 'GLCM Multi-Spectral Acoustic Detection',
    architecture: 'YOLOv8 with DySample Feature Pyramid & 5-Channel GLCM Tensor',
    capability: 'Resolves synthetic polyamide ghost netting against complex benthic reef structures via acoustic shadow-to-highlight ratio analysis.',
    benchmark: '96.4% mAP50 at 0.42m resolution',
    status: 'DEPLOYED',
  },
  {
    index: '02',
    module: 'UNDROIP 6-DOF Attitude Rectification',
    architecture: 'Real-time IMU Kalman filter with 2D-FFT de-striping algorithms',
    capability: 'Compensates vessel heave, pitch, roll, and yaw distortion to synthesize seamless, motion-corrected seabed mosaics.',
    benchmark: '14.2ms FP16 latency on NVIDIA Jetson Orin',
    status: 'DEPLOYED',
  },
  {
    index: '03',
    module: 'Sub-Meter PostGIS Geodetic Geotagging',
    architecture: 'USBL + DVL Acoustic fusion with WGS84 EPSG:4326 PostGIS geometry',
    capability: 'Calculates true geographic polygon footprints for each detected acoustic target and exports standardized geo-referenced layers.',
    benchmark: '±0.38m root-mean-square positioning error',
    status: 'ACTIVE',
  },
  {
    index: '04',
    module: 'Deterministic Telemetry & Verification Protocol',
    architecture: 'Seeded PRNG simulation bridge with SHA-256 evidence hashing',
    capability: 'Provides deterministic replayability of multi-beam surveys and cryptographically seals sonar hazard dossiers for naval interdiction.',
    benchmark: '100% repeatable acoustic reproduction',
    status: 'VERIFIED',
  },
];

export default function WhyMaris() {
  const [activeRow, setActiveRow] = useState<number>(0);

  return (
    <section id="specifications" className="relative py-20 px-4 sm:px-8 max-w-7xl mx-auto text-[#e2e8e4] border-b border-white/[0.08]">
      {/* Editorial Header */}
      <div className="grid lg:grid-cols-12 gap-8 mb-12 items-end">
        <div className="lg:col-span-8 space-y-4">
          <div className="inline-flex items-center gap-2 border border-white/[0.12] bg-[#101622] px-2.5 py-1 font-mono-inst text-[10px] uppercase tracking-widest text-[#8c978f]">
            <span>TECHNICAL BENCHMARKS</span>
            <span>/</span>
            <span className="text-[#e2e8e4]">SYSTEM ARCHITECTURE</span>
          </div>

          <h2 className="font-editorial text-3xl sm:text-5xl font-normal tracking-tight text-[#e2e8e4] leading-tight">
            Rigorous acoustic processing built for edge autonomy.
          </h2>
        </div>

        <div className="lg:col-span-4 font-mono-inst text-xs text-[#8c978f] leading-relaxed border-l border-white/[0.08] pl-4">
          Side-scan and multi-beam acoustic survey logs require automated real-time classification. MARIS runs onboard autonomous platforms with sub-meter spatial fidelity.
        </div>
      </div>

      {/* Asymmetrical Technical Ledger (Replaces 3 Generic Cards) */}
      <div className="border border-white/[0.12] bg-[#0b1018] divide-y divide-white/[0.08]">
        {/* Table Column Headers */}
        <div className="hidden md:grid grid-cols-12 px-5 py-3 font-mono-inst text-[10px] uppercase tracking-wider text-[#8c978f] bg-[#101622]">
          <div className="col-span-1">INDEX</div>
          <div className="col-span-4">PROCESSING MODULE</div>
          <div className="col-span-5">TECHNICAL CAPABILITY &amp; ARCHITECTURE</div>
          <div className="col-span-2 text-right">BENCHMARK</div>
        </div>

        {/* Dynamic Ledger Rows */}
        {SPEC_LEDGER.map((row, idx) => (
          <div
            key={row.index}
            onClick={() => setActiveRow(idx)}
            className={`cursor-pointer transition-colors ${
              activeRow === idx ? 'bg-[#101622]/90' : 'hover:bg-white/[0.02]'
            }`}
          >
            <div className="grid md:grid-cols-12 p-5 gap-4 items-start font-mono-inst">
              {/* Index & Status */}
              <div className="col-span-1 flex md:flex-col items-center md:items-start gap-2">
                <span className="text-xs font-semibold text-[#e2e8e4] tabular-nums">{row.index}</span>
                <span className="text-[9px] px-1.5 py-0.2 border border-[#5b937c]/40 text-[#5b937c] bg-[#5b937c]/10">
                  {row.status}
                </span>
              </div>

              {/* Module Name & Architecture */}
              <div className="col-span-4 space-y-1">
                <h3 className="text-sm font-semibold text-[#e2e8e4] uppercase tracking-wide">
                  {row.module}
                </h3>
                <p className="text-[11px] text-[#8c978f] leading-snug">
                  {row.architecture}
                </p>
              </div>

              {/* Capability Description */}
              <div className="col-span-5 text-xs text-[#8c978f] font-sans leading-relaxed">
                {row.capability}
              </div>

              {/* Quantitative Benchmark */}
              <div className="col-span-2 md:text-right font-mono-inst text-xs font-medium text-[#e2e8e4]">
                <span className="text-[#8c978f] text-[10px] md:hidden block">BENCHMARK:</span>
                {row.benchmark}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
