'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFilteredAnomalies } from '@/lib/demo';

export default function Scene5DottedGlobe() {
  const { anomalies } = useFilteredAnomalies();
  const totalDetections = anomalies.length;
  const highConfidenceCount = anomalies.filter((a) => a.confidence != null && a.confidence >= 0.85).length;

  const [countTotal, setCountTotal] = useState(0);
  const [countHighConf, setCountHighConf] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          // Animate total detections counter
          let startTotal = 0;
          const duration = 1500;
          const stepTime = 30;
          const totalSteps = duration / stepTime;
          const totalIncrement = totalDetections / totalSteps;

          const totalTimer = setInterval(() => {
            startTotal += totalIncrement;
            if (startTotal >= totalDetections) {
              setCountTotal(totalDetections);
              clearInterval(totalTimer);
            } else {
              setCountTotal(Math.floor(startTotal));
            }
          }, stepTime);

          // Animate high confidence counter
          let startHigh = 0;
          const highIncrement = highConfidenceCount / totalSteps;
          const highTimer = setInterval(() => {
            startHigh += highIncrement;
            if (startHigh >= highConfidenceCount) {
              setCountHighConf(highConfidenceCount);
              clearInterval(highTimer);
            } else {
              setCountHighConf(Math.floor(startHigh));
            }
          }, stepTime);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [totalDetections, highConfidenceCount, hasAnimated]);

  return (
    <section
      id="dotted-globe"
      ref={sectionRef}
      className="relative min-h-screen py-24 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col justify-between items-center text-center text-[#EDEBFF]"
    >
      {/* Category Pill & Heading */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0A0A2C]/60 px-3 py-1 font-mono-inst text-[10px] uppercase tracking-widest text-[#C7B6FF]">
          <span>GLOBAL POSTGIS SPATIAL COVERAGE</span>
        </div>

        <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-[#EDEBFF] leading-tight uppercase">
          Subsea anomaly coordinates geolocated in real time.
        </h2>
        <p className="text-sm sm:text-base text-[rgba(200,196,255,0.6)] leading-relaxed max-w-2xl mx-auto">
          Every acoustic target is georeferenced against EPSG:4326 WGS84 coordinates and indexed into distributed PostGIS spatial topologies.
        </p>
      </div>

      {/* Two Large Flanking Light Numerals (Count Up when in view) */}
      <div className="my-16 grid sm:grid-cols-2 gap-12 sm:gap-24 w-full max-w-4xl font-mono-inst">
        {/* Metric 1: Total Detections */}
        <div className="rounded-3xl border border-white/10 bg-[#0A0A2C]/30 backdrop-blur-xl p-8 space-y-2">
          <span className="text-[11px] uppercase tracking-widest text-[rgba(200,196,255,0.7)] block">
            TOTAL ACOUSTIC DETECTIONS
          </span>
          <div className="text-6xl sm:text-8xl font-black text-[#EDEBFF] tabular-nums leading-none">
            {countTotal}
          </div>
          <p className="text-xs text-[rgba(200,196,255,0.5)] pt-2">
            Multi-frequency swath targets indexed across operational zones
          </p>
        </div>

        {/* Metric 2: High Confidence Targets */}
        <div className="rounded-3xl border border-white/10 bg-[#0A0A2C]/30 backdrop-blur-xl p-8 space-y-2">
          <span className="text-[11px] uppercase tracking-widest text-[#C7B6FF] block">
            HIGH CONFIDENCE (85%+)
          </span>
          <div className="text-6xl sm:text-8xl font-black text-[#C7B6FF] tabular-nums leading-none">
            {countHighConf}
          </div>
          <p className="text-xs text-[rgba(200,196,255,0.5)] pt-2">
            Validated by dual-band YOLOv8-GLCM texture classification
          </p>
        </div>
      </div>

      {/* Real Detection Pins Footnote */}
      <div className="flex items-center gap-4 text-xs font-mono-inst text-[rgba(200,196,255,0.7)]">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#EDEBFF]" />
          <span>Active Detection Pins (Live Geotags)</span>
        </span>
        <span>|</span>
        <span>SRID 4326 (WGS84 Sub-Meter Bounds)</span>
      </div>
    </section>
  );
}
