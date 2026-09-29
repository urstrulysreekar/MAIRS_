'use client';

import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TopographicBackground from '@/components/hero/TopographicBackground';

// Dynamically import 3D WebGL Planet with SSR disabled
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

      {/* ── 2. Tactical Topographic & Network Nodes SVG Background (Behind 3D Canvas) ── */}
      <TopographicBackground />

      {/* Atmospheric space haze behind WebGL planet */}
      <div className="absolute inset-0 pointer-events-none -z-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] rounded-full bg-cyan-900/10 blur-[150px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[45rem] h-[45rem] rounded-full bg-purple-900/15 blur-[160px] pointer-events-none" />
      </div>

      {/* ── 3. Interactive 3D WebGL Earth at Night (Mounted via HeroCanvas at z-index: -1) ── */}
      <HeroCanvas />

      {/* ── 4. Main Hero Typography: MARIS spaced extremely far across full width with Neon Glassmorphic Glow ── */}
      <div className="relative z-20 w-full flex justify-between items-center px-8 sm:px-14 md:px-20 lg:px-24 select-none pointer-events-none">
        {['M', 'A', 'R', 'I', 'S'].map((char) => (
          <span
            key={char}
            className="text-7xl sm:text-9xl md:text-[10rem] lg:text-[12rem] xl:text-[13.5rem] font-black uppercase tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-600 drop-shadow-[0_0_25px_rgba(168,85,247,0.8)] drop-shadow-[0_0_50px_rgba(6,182,212,0.6)] filter"
            style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              WebkitTextStroke: '2px white',
            }}
          >
            {char}
          </span>
        ))}
      </div>

      {/* ── 5. Bottom Hero Content ── */}
      <div className="absolute bottom-12 w-full flex flex-col items-center justify-center gap-6 z-20 pointer-events-auto">
        {/* Subheading: 'THAT SIMPLY WORKS' (white, medium tracking, uppercase) */}
        <p className="font-mono text-xs sm:text-sm font-semibold tracking-[0.25em] text-white uppercase select-none">
          THAT SIMPLY WORKS
        </p>

        {/* CTA Button: Solid white background, dark text, and strong mixed-color cyan & purple glowing aura */}
        <button
          type="button"
          onClick={() => router.push('/console')}
          className="px-9 py-3.5 sm:px-11 sm:py-4 rounded-full bg-white text-black font-semibold text-sm sm:text-base tracking-wide hover:bg-neutral-100 transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.5),0_0_50px_rgba(168,85,247,0.4)] hover:shadow-[0_0_45px_rgba(6,182,212,0.7),0_0_70px_rgba(168,85,247,0.6)] hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
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
