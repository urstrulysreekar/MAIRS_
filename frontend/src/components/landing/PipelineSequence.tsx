'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileUp,
  Activity,
  Layers,
  Cpu,
  MapPin,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function PipelineSequence() {
  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    {
      id: '01',
      title: 'XTF / JSF Ingest',
      short: 'Binary Ingestion',
      icon: FileUp,
      badge: '0.08ms Latency',
      desc: 'Direct binary packet parsing of dual-frequency 100/400 kHz side-scan sonar files (eXtended Triton Format & Edgetech JSF). Fast slant-range correction removes water column deadzones.',
      stats: [
        { label: 'Channels', val: 'Dual Port/Starboard' },
        { label: 'Sampling Rate', val: '400 kHz HF' },
      ],
    },
    {
      id: '02',
      title: 'UNDROIP Motion Correction',
      short: 'IMU Fusion',
      icon: Activity,
      badge: '6-DOF Attitude',
      desc: 'Real-time attitude matrix compensation removes vessel heave, pitch, and roll distortion. Adaptive 2D-FFT de-striping filters eliminate surface acoustic reflection harmonics.',
      stats: [
        { label: 'Attitude Matrix', val: 'Roll/Pitch/Yaw' },
        { label: 'De-stripe Filter', val: '2D-FFT Notch' },
      ],
    },
    {
      id: '03',
      title: 'Swath Mosaicking',
      short: 'Continuous Stitching',
      icon: Layers,
      badge: '200m Across-Track',
      desc: 'Continuous dual-beam swath stitching generates seamless bathymetric raster tiles. Dynamic blend weighting eliminates boundary seam artifacts between adjacent survey tracklines.',
      stats: [
        { label: 'Swath Width', val: '200 Meters' },
        { label: 'Tile Resolution', val: '0.05 m/px' },
      ],
    },
    {
      id: '04',
      title: 'YOLOv8 + GLCM Anomaly Detection',
      short: 'Neural Classifier',
      icon: Cpu,
      badge: 'mAP50: 94.8%',
      desc: 'DySample FPN architecture coupled with 5-channel Gray-Level Co-occurrence Matrix (GLCM) texture tensors. Isolates synthetic ghost nets from natural seabed geological formations.',
      stats: [
        { label: 'Inference Time', val: '14.2 ms (FP16)' },
        { label: 'Texture Tensor', val: '5-Ch Haralick' },
      ],
    },
    {
      id: '05',
      title: 'PostGIS Geotagging',
      short: 'Sub-Meter SRID:4326',
      icon: MapPin,
      badge: 'Sub-Meter Precision',
      desc: 'USBL and DVL acoustic positioning fusion converts pixel coordinates into sub-meter global WGS84 PostGIS polygon geometries, ready for recovery ship routing.',
      stats: [
        { label: 'Coordinate System', val: 'EPSG:4326' },
        { label: 'Error Margin', val: '±0.38 m' },
      ],
    },
  ];

  return (
    <section id="pipeline" className="relative py-28 px-6 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="space-y-4 max-w-3xl mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0c1022]/80 px-3.5 py-1 text-xs font-mono font-medium text-cyan-400 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" />
          <span>REAL-TIME EDGE PIPELINE · 5 STAGES</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          From Raw Acoustic Stream to PostGIS Target
        </h2>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Explore the deterministic five-stage edge pipeline that transforms raw binary sonar backscatter
          into actionable, sub-meter maritime hazard coordinates.
        </p>
      </div>

      {/* Pipeline Navigation Bar */}
      <div className="relative mb-12">
        {/* Connecting Glowing Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-white/10 hidden md:block">
          <motion.div
            className="h-full bg-gradient-to-r from-[#00f0ff] via-[#d946ef] to-[#00f0ff]"
            animate={{ width: `${((activeStage + 1) / stages.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* 5 Stage Node Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative z-10">
          {stages.map((stg, idx) => {
            const isSelected = activeStage === idx;
            const Icon = stg.icon;

            return (
              <button
                key={stg.id}
                onClick={() => setActiveStage(idx)}
                className={`flex flex-col items-center text-center p-3.5 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? 'border-cyan-400 bg-[#0c142c] shadow-[0_0_25px_rgba(0,240,255,0.25)] scale-105'
                    : 'border-white/10 bg-[#080d1c]/80 hover:border-white/30 text-slate-400 hover:text-white'
                }`}
              >
                <span className="font-syncopate text-[10px] font-bold text-cyan-400 mb-1">
                  STAGE {stg.id}
                </span>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg border mb-2 transition-colors ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300'
                      : 'border-white/10 bg-white/5 text-slate-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-space text-xs font-bold truncate max-w-full text-white">
                  {stg.short}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Stage Detailed Spotlight Box */}
      <motion.div
        key={activeStage}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-cyan-500/30 bg-[#0b1022]/90 p-8 sm:p-12 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)]"
      >
        <div className="grid lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-syncopate text-2xl font-black text-cyan-400">
                {stages[activeStage].id}
              </span>
              <h3 className="font-space text-2xl sm:text-3xl font-black text-white">
                {stages[activeStage].title}
              </h3>
              <span className="font-mono text-xs font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-950/40 px-3 py-0.5 rounded-full">
                {stages[activeStage].badge}
              </span>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              {stages[activeStage].desc}
            </p>
          </div>

          {/* Quick Technical Specs Grid */}
          <div className="space-y-3 bg-[#060914] p-6 rounded-2xl border border-white/10">
            <span className="font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Technical Specifications
            </span>
            {stages[activeStage].stats.map((st) => (
              <div
                key={st.label}
                className="flex items-center justify-between border-t border-white/10 pt-2 font-mono text-xs"
              >
                <span className="text-slate-400">{st.label}</span>
                <span className="font-bold text-cyan-300">{st.val}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
