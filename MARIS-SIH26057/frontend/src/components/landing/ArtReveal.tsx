'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ArtReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [activeBeat, setActiveBeat] = useState(0);

  const BEATS = [
    {
      index: 'PHASE 01',
      title: 'Acoustic Backscatter Isolation',
      body: 'Dual-frequency acoustic transducers emit structured sonar pings across the seafloor. Synthetic fibers scatter sound waves with high-frequency diffraction distinct from bedrock sediment.',
      metric: '900 kHz Sampling Frequency',
      depth: 'SURFACE TRANSECT · 12M DEPTH',
    },
    {
      index: 'PHASE 02',
      title: 'GLCM Texture Tensor Calculation',
      body: 'Gray-Level Co-occurrence Matrices evaluate angular second moments, contrast, entropy, and spatial homogeneity to distinguish man-made netting from natural marine biodiversity.',
      metric: '5-Channel Haralick Tensors',
      depth: 'WATER COLUMN SCAN · 28M DEPTH',
    },
    {
      index: 'PHASE 03',
      title: 'Sub-Meter Geodetic Projection',
      body: 'Attitude-corrected acoustic coordinates are mapped directly to PostGIS spatial polygons (SRID:4326), exporting actionable targets to naval interdiction ships.',
      metric: '±0.38m Error Radius',
      depth: 'SEABED BATHYMETRY · 64M DEPTH',
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!containerRef.current || !stageRef.current) return;

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: stageRef.current,
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress;
          if (p < 0.33) setActiveBeat(0);
          else if (p < 0.66) setActiveBeat(1);
          else setActiveBeat(2);
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative h-[240vh] bg-[#070a0f] text-[#e2e8e4] border-b border-white/[0.08]">
      <div ref={stageRef} className="relative h-screen w-full flex items-center justify-center px-4 sm:px-8">
        {/* Background Graticule */}
        <div className="absolute inset-0 pointer-events-none nautical-graticule opacity-20 z-0" />

        <div className="relative z-10 max-w-5xl mx-auto w-full grid md:grid-cols-12 gap-8 items-center font-mono-inst">
          {/* Left Column: Pinned Sonar Scope Visualization */}
          <div className="md:col-span-6 border border-white/[0.12] bg-[#0b1018] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 text-xs">
              <span className="text-[#8c978f] uppercase">ACOUSTIC CROSS-SECTION</span>
              <span className="text-[#5b937c] font-semibold">{BEATS[activeBeat].index}</span>
            </div>

            {/* Structured Sonar Sweep Visualizer */}
            <div className="relative h-64 w-full border border-white/[0.08] bg-[#040609] flex flex-col justify-between p-4 overflow-hidden">
              <div className="flex justify-between text-[10px] text-[#8c978f]">
                <span>RANGE: 150M</span>
                <span>AZIMUTH: 042°</span>
                <span className="text-[#e2e8e4] font-semibold">{BEATS[activeBeat].depth}</span>
              </div>

              {/* Concentric Range Rings */}
              <div className="relative flex-1 flex items-center justify-center">
                <div className="absolute h-40 w-40 border border-white/10 rounded-full" />
                <div className="absolute h-24 w-24 border border-white/15 rounded-full" />
                <div className="absolute h-8 w-8 border border-[#5b937c]/40 rounded-full" />
                <div className="h-1.5 w-1.5 bg-[#5b937c]" />
              </div>

              <div className="flex justify-between text-[10px] text-[#8c978f]">
                <span>CONF: 96.4%</span>
                <span className="text-[#5b937c]">SRID: 4326</span>
              </div>
            </div>

            <div className="text-[11px] text-[#8c978f] flex justify-between">
              <span>BENCHMARK:</span>
              <span className="text-[#e2e8e4] font-semibold">{BEATS[activeBeat].metric}</span>
            </div>
          </div>

          {/* Right Column: Progressive Editorial Narrative */}
          <div className="md:col-span-6 space-y-4 pl-0 md:pl-6 border border-white/[0.06] bg-[#0b1018] p-6">
            <div className="text-xs text-[#5b937c] uppercase tracking-widest font-semibold">
              {BEATS[activeBeat].index}
            </div>

            <h2 className="font-editorial text-3xl sm:text-4xl font-normal text-[#e2e8e4] tracking-tight leading-snug">
              {BEATS[activeBeat].title}
            </h2>

            <p className="font-sans text-sm sm:text-base text-[#8c978f] leading-relaxed">
              {BEATS[activeBeat].body}
            </p>

            <div className="pt-4 flex items-center gap-2">
              {BEATS.map((b, idx) => (
                <div
                  key={b.index}
                  className={`h-1 flex-1 transition-colors ${
                    activeBeat === idx ? 'bg-[#5b937c]' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
