'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Radio, Cpu, MapPin, Sparkles } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ArtReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const ring1Ref = useRef<HTMLDivElement>(null);
  const ring2Ref = useRef<HTMLDivElement>(null);
  const ring3Ref = useRef<HTMLDivElement>(null);

  const [activeBeat, setActiveBeat] = useState(0);
  const [scrollProg, setScrollProg] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Mouse Tilt
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const nx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const ny = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setTilt({ x: ny * -6, y: nx * 6 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

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
          setScrollProg(p);

          // Update Active Text Beat (0, 1, 2)
          if (p < 0.33) setActiveBeat(0);
          else if (p < 0.66) setActiveBeat(1);
          else setActiveBeat(2);

          // Orb Animation according to Part 2.C spec:
          if (orbRef.current) {
            let scale = 0.6;
            let clipRadius = 4;
            let opacity = 0;
            let rotation = 0;
            let hue = 0;

            if (p <= 0.25) {
              const t = p / 0.25;
              scale = gsap.utils.interpolate(0.6, 1, t);
              clipRadius = gsap.utils.interpolate(4, 55, t);
              opacity = gsap.utils.interpolate(0, 1, t);
            } else if (p <= 0.75) {
              const t = (p - 0.25) / 0.5;
              scale = gsap.utils.interpolate(1, 1.18, t);
              clipRadius = 55;
              opacity = 1;
              rotation = gsap.utils.interpolate(0, 24, t);
              hue = gsap.utils.interpolate(0, 45, t);
            } else {
              const t = (p - 0.75) / 0.25;
              scale = gsap.utils.interpolate(1.18, 1.45, t);
              clipRadius = 55;
              opacity = gsap.utils.interpolate(1, 0, t);
              rotation = 24 + t * 6;
              hue = 45;
            }

            orbRef.current.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
            orbRef.current.style.clipPath = `circle(${clipRadius}% at 50% 50%)`;
            orbRef.current.style.opacity = `${opacity}`;
            orbRef.current.style.filter = `hue-rotate(${hue}deg)`;
          }

          // Concentric Ring outlines expanding
          if (ring1Ref.current) {
            ring1Ref.current.style.transform = `translate(-50%, -50%) scale(${1 + p * 0.8})`;
            ring1Ref.current.style.opacity = `${(1 - p * 0.6) * 0.25}`;
          }
          if (ring2Ref.current) {
            ring2Ref.current.style.transform = `translate(-50%, -50%) scale(${1 + p * 1.4})`;
            ring2Ref.current.style.opacity = `${(1 - p * 0.7) * 0.2}`;
          }
          if (ring3Ref.current) {
            ring3Ref.current.style.transform = `translate(-50%, -50%) scale(${1 + p * 2.1})`;
            ring3Ref.current.style.opacity = `${(1 - p * 0.9) * 0.15}`;
          }

          // Specular Sheen sweep
          if (sheenRef.current) {
            sheenRef.current.style.transform = `translateX(${p * 200 - 50}%) rotate(45deg)`;
          }
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const beats = [
    {
      num: '01',
      tag: 'INGESTION LAYER',
      title: 'Raw Sonar Telemetry',
      desc: 'Dual-frequency side-scan sonar packets in raw XTF and JSF formats streamed straight from survey vessels with sub-millisecond edge ingest.',
      icon: Radio,
      color: '#00f0ff',
    },
    {
      num: '02',
      tag: 'NEURAL CLASSIFICATION',
      title: 'UNDROIP + YOLOv8 GLCM',
      desc: '6-DOF IMU attitude compensation and 2D-FFT de-striping, feeding YOLOv8-DySample 5-channel GLCM texture tensors for anomaly identification.',
      icon: Cpu,
      color: '#38bdf8',
    },
    {
      num: '03',
      tag: 'POSTGIS GEOTAGGING',
      title: 'Sub-Meter Seabed Anchor',
      desc: 'Acoustic USBL and Doppler Velocity Log fusion converting anomaly pixel bounding boxes into sub-meter WGS84 PostGIS polygon geometries.',
      icon: MapPin,
      color: '#0ac5b2',
    },
  ];

  return (
    <section
      id="reveal"
      ref={containerRef}
      className="relative h-[300vh] bg-[#02020a] text-white"
    >
      {/* ── Pinned Stage (100vh viewport) ── */}
      <div
        ref={stageRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden"
      >
        {/* Ambient Back Glow */}
        <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-[#140da8]/30 via-transparent to-transparent opacity-80" />

        {/* ── Concentric Ring Outlines Expanding with Scroll ── */}
        <div
          ref={ring1Ref}
          className="absolute top-1/2 left-1/2 w-[420px] sm:w-[580px] h-[420px] sm:h-[580px] rounded-full border border-white/20 pointer-events-none transition-transform duration-75"
        />
        <div
          ref={ring2Ref}
          className="absolute top-1/2 left-1/2 w-[580px] sm:w-[780px] h-[580px] sm:h-[780px] rounded-full border border-cyan-400/20 pointer-events-none transition-transform duration-75"
        />
        <div
          ref={ring3Ref}
          className="absolute top-1/2 left-1/2 w-[740px] sm:w-[980px] h-[740px] sm:h-[980px] rounded-full border border-violet-400/15 pointer-events-none transition-transform duration-75"
        />

        {/* ── Main Stage Grid: Left Telemetry Card | Center-Right Orb ── */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 flex items-center justify-between">
          {/* Left Text Beat Container */}
          <div className="w-full max-w-sm sm:max-w-md pointer-events-auto z-20">
            {beats.map((beat, idx) => {
              const isActive = activeBeat === idx;
              const Icon = beat.icon;

              return (
                <div
                  key={beat.num}
                  className={`transition-all duration-700 ${
                    isActive
                      ? 'opacity-100 translate-y-0 relative'
                      : 'opacity-0 translate-y-8 absolute pointer-events-none'
                  }`}
                >
                  <div className="rounded-2xl border border-white/15 bg-[#090e20]/90 p-6 sm:p-7 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-syncopate text-2xl sm:text-3xl font-black text-cyan-400">
                        {beat.num}
                      </span>
                      <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 px-3 py-0.5 rounded-full">
                        <Icon className="h-3 w-3" />
                        <span>{beat.tag}</span>
                      </div>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-white">
                      {beat.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {beat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center-Right: The Centerpiece Orb Container with 3D Tilt */}
          <div
            style={{
              transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: 'transform 0.2s ease-out',
            }}
            className="relative z-10 w-[280px] sm:w-[420px] lg:w-[480px] h-[280px] sm:h-[420px] lg:h-[480px] flex items-center justify-center shrink-0"
          >
            {/* Iridescent Orb Asset with Screen Blend Mode */}
            <div
              ref={orbRef}
              className="relative w-full h-full will-change-transform"
              style={{
                mixBlendMode: 'screen',
                filter: 'drop-shadow(0 0 50px rgba(0, 240, 255, 0.4))',
              }}
            >
              <Image
                src="/media/orb.webp"
                alt="MARIS Iridescent Sonar Intelligence Orb"
                fill
                priority
                sizes="(max-width: 768px) 280px, (max-width: 1200px) 420px, 480px"
                className="object-contain"
              />

              {/* Specular Sheen Sweep Overlay */}
              <div
                ref={sheenRef}
                className="absolute inset-0 pointer-events-none opacity-30 bg-gradient-to-r from-transparent via-white to-transparent"
                style={{ mixBlendMode: 'overlay' }}
              />
            </div>
          </div>

          {/* Right Progress Dots & Filling Bar */}
          <div className="hidden lg:flex flex-col items-center gap-6 pointer-events-auto shrink-0 pl-4">
            <div className="flex flex-col items-center gap-3">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className={`h-3 w-3 rounded-full border transition-all duration-300 ${
                    activeBeat === idx
                      ? 'border-[#00f0ff] bg-[#00f0ff] scale-125 shadow-[0_0_12px_#00f0ff]'
                      : 'border-white/20 bg-[#0c1022]'
                  }`}
                />
              ))}
            </div>

            {/* Vertical Filling Track */}
            <div className="h-24 w-0.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="w-full bg-[#00f0ff] transition-all duration-150"
                style={{ height: `${scrollProg * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
