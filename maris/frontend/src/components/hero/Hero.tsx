'use client';

import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Dynamically import Three.js Hero Canvas with SSR disabled
const HeroCanvas = dynamic(() => import('@/components/canvas/HeroCanvas'), {
  ssr: false,
  loading: () => null,
});

export default function Hero() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen min-h-screen overflow-hidden bg-[#050515] select-none flex items-center justify-center"
      style={{ isolation: 'isolate' }}
    >
      {/* ── 1. Navbar (Top) ── */}
      <nav className="flex justify-between items-center w-full px-8 py-6 absolute top-0 z-50 pointer-events-auto">
        {/* Left: Pill-shaped translucent badge containing 'MARIS' */}
        <Link
          href="/"
          className="px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.05] backdrop-blur-md hover:bg-white/[0.1] hover:border-white/20 transition-all flex items-center gap-2 group shadow-[0_0_15px_rgba(255,255,255,0.03)]"
          aria-label="MARIS Home"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
          <span className="font-mono text-xs font-bold tracking-[0.25em] text-white">
            MARIS
          </span>
        </Link>

        {/* Center: Navigation links with small, subtle text matching application routes */}
        <div className="hidden lg:flex items-center gap-8 font-mono text-xs text-white/50 tracking-wider">
          <Link
            href="/console"
            className="hover:text-white transition-colors duration-200"
          >
            Operations Console
          </Link>
          <Link
            href="/map"
            className="hover:text-white transition-colors duration-200"
          >
            Swath Map
          </Link>
          <Link
            href="/upload"
            className="hover:text-white transition-colors duration-200"
          >
            Sonar Ingestion
          </Link>
          <Link
            href="/anomalies"
            className="hover:text-white transition-colors duration-200"
          >
            Target Inventory
          </Link>
          <Link
            href="/reports"
            className="hover:text-white transition-colors duration-200"
          >
            Executive Reports
          </Link>
        </div>

        {/* Right: Placeholder pill buttons for language selection ('EN') and 'Log in' */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-3.5 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs font-mono text-white/60 hover:text-white hover:border-white/25 transition-all cursor-default"
          >
            EN
          </button>
          <Link
            href="/login"
            className="px-5 py-1.5 rounded-full border border-white/15 bg-white/[0.08] hover:bg-white/[0.16] hover:border-white/30 text-xs font-mono font-medium text-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          >
            Log in
          </Link>
        </div>
      </nav>

      {/* ── 2. Background Glowing Eclipse Effect ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
        {/* Layer 1: Extreme blur deep blue volumetric background halo */}
        <div className="absolute w-[55rem] h-[55rem] rounded-full bg-blue-900/35 blur-[140px] pointer-events-none" />

        {/* Layer 2: Electric cyan / royal blue core inner glow */}
        <div className="absolute w-[38rem] h-[38rem] rounded-full bg-cyan-500/15 blur-[95px] pointer-events-none" />
        <div className="absolute w-[24rem] h-[24rem] rounded-full bg-blue-600/25 blur-[65px] pointer-events-none" />

        {/* Layer 3: Central Celestial Eclipse Disc with Asymmetrical Glowing Ring */}
        <div className="relative w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] md:w-[600px] md:h-[600px] lg:w-[680px] lg:h-[680px] flex items-center justify-center">
          {/* Asymmetrical Glowing SVG Crescent Arc with Multi-Tier Filters */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-12 scale-105"
            viewBox="0 0 500 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Luminous Crescent Gradient: Pure white apex -> Electric Cyan -> Deep Cobalt -> Transparent */}
              <linearGradient id="eclipseGlowGradient" x1="10%" y1="0%" x2="90%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="22%" stopColor="#bae6fd" stopOpacity="0.95" />
                <stop offset="48%" stopColor="#38bdf8" stopOpacity="0.75" />
                <stop offset="72%" stopColor="#1d4ed8" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#050515" stopOpacity="0" />
              </linearGradient>

              {/* Multi-tier Glow Filter */}
              <filter id="crescentBloomFilter" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="sharpGlow" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="midGlow" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="28" result="wideGlow" />
                <feMerge>
                  <feMergeNode in="wideGlow" />
                  <feMergeNode in="midGlow" />
                  <feMergeNode in="sharpGlow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Diffuse Outer Ambient Corona */}
            <circle
              cx="250"
              cy="250"
              r="230"
              stroke="url(#eclipseGlowGradient)"
              strokeWidth="4"
              strokeDasharray="940 500"
              strokeDashoffset="180"
              opacity="0.5"
              filter="blur(18px)"
            />

            {/* Mid-Core Glowing Crescent */}
            <circle
              cx="250"
              cy="250"
              r="228"
              stroke="url(#eclipseGlowGradient)"
              strokeWidth="5"
              strokeDasharray="800 650"
              strokeDashoffset="210"
              filter="url(#crescentBloomFilter)"
            />

            {/* Razor-Sharp White/Blue Crescent Edge */}
            <circle
              cx="250"
              cy="250"
              r="226"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeDasharray="440 1000"
              strokeDashoffset="240"
              opacity="0.98"
              style={{
                filter: 'drop-shadow(0 0 6px #ffffff) drop-shadow(0 0 18px #38bdf8)',
              }}
            />
          </svg>

          {/* Eclipsing Dark Disc blending into the midnight blue/black background */}
          <div className="w-[94%] h-[94%] rounded-full bg-[#050515] shadow-[inset_0_0_60px_rgba(10,25,50,0.85)] relative z-0" />
        </div>
      </div>

      {/* ── 3D Photorealistic Planet Element (Behind typography at z-index: -1) ── */}
      <HeroCanvas />

      {/* ── 3. Main Hero Typography: MARIS spaced extremely far across full width ── */}
      <div className="relative z-20 w-full flex justify-between items-center px-8 sm:px-14 md:px-20 lg:px-24 select-none pointer-events-none">
        {['M', 'A', 'R', 'I', 'S'].map((char) => (
          <span
            key={char}
            className="text-7xl sm:text-9xl md:text-[10rem] lg:text-[12rem] xl:text-[13.5rem] font-black text-white uppercase tracking-tighter leading-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)]"
            style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            {char}
          </span>
        ))}
      </div>

      {/* ── 4. Bottom Hero Content ── */}
      <div className="absolute bottom-12 w-full flex flex-col items-center justify-center gap-6 z-20 pointer-events-auto">
        {/* Subheading: 'THAT SIMPLY WORKS' (white, medium tracking, uppercase) */}
        <p className="font-mono text-xs sm:text-sm font-semibold tracking-[0.25em] text-white uppercase select-none">
          THAT SIMPLY WORKS
        </p>

        {/* CTA Button: Fully rounded pill shape (rounded-full), solid white background, black text reading 'Launch Demo Mode', with ample horizontal padding */}
        <button
          type="button"
          onClick={() => router.push('/console')}
          className="px-9 py-3.5 sm:px-11 sm:py-4 rounded-full bg-white text-black font-semibold text-sm sm:text-base tracking-wide hover:bg-neutral-200 transition-all shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.55)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          Launch Demo Mode
        </button>

        {/* Footer Text: 'Enterprise Grade Security' positioned directly below CTA (small, muted gray text) */}
        <span className="text-[11px] sm:text-xs font-mono text-[#8c978f] tracking-wider select-none">
          Enterprise Grade Security
        </span>
      </div>
    </section>
  );
}
