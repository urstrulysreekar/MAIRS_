'use client';

import React, { useState } from 'react';

const STAGES = [
  {
    id: '01',
    title: 'XTF / JSF Binary Ingestion',
    method: 'Direct ping-header stream deserialization',
    latency: '0.08 ms',
    specification: 'Parses dual-frequency 100/400 kHz side-scan sonar packets (eXtended Triton Format & Edgetech JSF). Slant-range transforms remove water column deadzones.',
    io: { input: 'Raw Binary Sonar (.XTF)', output: 'Normalized Float32 Raster' },
  },
  {
    id: '02',
    title: 'UNDROIP Attitude Rectification',
    method: '6-DOF IMU Kalman filter & 2D-FFT Notch',
    latency: '3.40 ms',
    specification: 'Compensates vessel heave, pitch, roll, and yaw distortion. Adaptive 2D-FFT de-striping filters eliminate surface acoustic reflection harmonics.',
    io: { input: 'Raw IMU Telemetry Matrix', output: 'Motion-Corrected Swath' },
  },
  {
    id: '03',
    title: 'Swath Mosaicking & Tiling',
    method: 'Dynamic across-track boundary weighting',
    latency: '2.10 ms',
    specification: 'Continuous dual-beam swath stitching generates seamless bathymetric raster tiles (0.05m/px resolution) with zero boundary seam distortion.',
    io: { input: 'Port / Starboard Swaths', output: 'Georeferenced 512x512 Tiles' },
  },
  {
    id: '04',
    title: 'YOLOv8 + GLCM Feature Extraction',
    method: 'DySample FPN + 5-Channel Haralick Tensors',
    latency: '14.2 ms (FP16)',
    specification: 'Calculates 5-channel Gray-Level Co-occurrence Matrix (GLCM) texture tensors. Isolates synthetic ghost nets from natural seabed geological formations.',
    io: { input: 'Multi-Channel Acoustic Tiles', output: 'Bounding Boxes & Class Probabilities' },
  },
  {
    id: '05',
    title: 'Sub-Meter PostGIS Geotagging',
    method: 'USBL + DVL geodetic projection',
    latency: '0.45 ms',
    specification: 'Acoustic positioning fusion maps pixel detections to global WGS84 PostGIS polygon geometries (EPSG:4326) with root-mean-square error under 0.38m.',
    io: { input: 'Pixel Bounding Boxes & GPS', output: 'PostGIS Polygons (SRID:4326)' },
  },
];

export default function PipelineSequence() {
  const [selectedStage, setSelectedStage] = useState(0);
  const active = STAGES[selectedStage];

  return (
    <section id="pipeline" className="relative py-20 px-4 sm:px-8 max-w-7xl mx-auto text-[#e2e8e4] border-b border-white/[0.08]">
      {/* Header */}
      <div className="max-w-3xl space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 border border-white/[0.12] bg-[#101622] px-2.5 py-1 font-mono-inst text-[10px] uppercase tracking-widest text-[#8c978f]">
          <span>DATA TRANSMISSION &amp; INFERENCE FLOW</span>
        </div>
        <h2 className="font-editorial text-3xl sm:text-5xl font-normal tracking-tight text-[#e2e8e4] leading-tight">
          Five-stage edge acoustic pipeline.
        </h2>
        <p className="text-sm sm:text-base text-[#8c978f] leading-relaxed">
          From raw hydrographic binary log ingestion to sub-meter PostGIS hazard geotagging, every millisecond of the signal processing chain is deterministic.
        </p>
      </div>

      {/* Horizontal Stage Selector Matrix */}
      <div className="grid grid-cols-5 border border-white/[0.12] bg-[#0b1018] divide-x divide-white/[0.08] font-mono-inst text-xs">
        {STAGES.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedStage(idx)}
            className={`p-4 text-left transition-colors ${
              selectedStage === idx ? 'bg-[#101622] text-[#e2e8e4]' : 'text-[#8c978f] hover:bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tabular-nums">{s.id}</span>
              <span className={`h-1.5 w-1.5 ${selectedStage === idx ? 'bg-[#5b937c]' : 'bg-transparent'}`} />
            </div>
            <div className="mt-2 font-medium truncate uppercase text-[11px]">
              {s.title.split(' ')[0]}
            </div>
          </button>
        ))}
      </div>

      {/* Detailed Stage Inspector Panel */}
      <div className="mt-4 border border-white/[0.12] bg-[#0b1018] p-6 font-mono-inst">
        <div className="grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-[#e2e8e4] uppercase">
                STAGE {active.id} : {active.title}
              </span>
              <span className="border border-[#5b937c]/40 bg-[#5b937c]/10 text-[#5b937c] text-[10px] px-2 py-0.5">
                LATENCY : {active.latency}
              </span>
            </div>

            <p className="font-sans text-sm text-[#8c978f] leading-relaxed">
              {active.specification}
            </p>

            <div className="text-[11px] text-[#8c978f]">
              <span className="text-[#e2e8e4]">PRIMARY ALGORITHM:</span> {active.method}
            </div>
          </div>

          <div className="md:col-span-5 space-y-3 border-t md:border-t-0 md:border-l border-white/[0.08] pt-4 md:pt-0 md:pl-6 text-[11px]">
            <div className="border border-white/[0.06] bg-[#101622] p-3 space-y-1">
              <span className="text-[9px] uppercase tracking-wider text-[#8c978f] block">INPUT SPECIFICATION</span>
              <span className="font-semibold text-[#e2e8e4]">{active.io.input}</span>
            </div>

            <div className="border border-white/[0.06] bg-[#101622] p-3 space-y-1">
              <span className="text-[9px] uppercase tracking-wider text-[#8c978f] block">OUTPUT ARTIFACT</span>
              <span className="font-semibold text-[#5b937c]">{active.io.output}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
