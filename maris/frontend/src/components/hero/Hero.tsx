'use client';

import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
      className="relative w-full h-screen min-h-screen overflow-hidden bg-[#030305] select-none flex items-center justify-center"
      style={{ isolation: 'isolate' }}
    >
      {/* ── 1. Navbar (Top) ── */}
      <nav className="flex justify-between items-center w-full px-8 py-6 absolute top-0 z-50 pointer-events-auto">
        {/* Left: Refined translucent badge containing 'MARIS' */}
        <Link
          href="/"
          className="px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md hover:bg-white/[0.08] hover:border-white/20 transition-all flex items-center gap-2.5 group"
          aria-label="MARIS Home"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
          <span className="font-mono text-xs font-bold tracking-[0.25em] text-white">
            MARIS
          </span>
        </Link>

        {/* Center: Navigation links with small, subtle text matching application routes */}
        <div className="hidden lg:flex items-center gap-8 font-mono text-xs text-neutral-400 tracking-wider">
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

        {/* Right: Pill buttons for language selection ('EN') and 'Log in' */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-3.5 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs font-mono text-neutral-400 hover:text-white hover:border-white/20 transition-all cursor-default"
          >
            EN
          </button>
          <Link
            href="/login"
            className="px-5 py-1.5 rounded-full border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] hover:border-white/25 text-xs font-mono font-medium text-white transition-all"
          >
            Log in
          </Link>
        </div>
      </nav>

      {/* ── 2. Interactive 3D WebGL Obsidian Planet (Mounted via HeroCanvas at z-index: -1) ── */}
      <HeroCanvas />

      {/* ── 3. Main Hero Typography: MARIS spaced across full width behind planet ── */}
      <div className="relative z-20 w-full flex justify-between items-center px-8 sm:px-14 md:px-20 lg:px-24 select-none pointer-events-none">
        {['M', 'A', 'R', 'I', 'S'].map((char) => (
          <span
            key={char}
            className="text-7xl sm:text-9xl md:text-[10rem] lg:text-[12rem] xl:text-[13.5rem] font-black uppercase tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500"
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
        {/* Subheading: 'THAT SIMPLY WORKS' */}
        <p className="font-mono text-xs sm:text-sm font-medium tracking-[0.28em] text-neutral-400 uppercase select-none">
          THAT SIMPLY WORKS
        </p>

        {/* CTA Button: Crisp, solid white pill with hover:scale-105 transition-transform */}
        <button
          type="button"
          onClick={() => router.push('/console')}
          className="px-9 py-3.5 sm:px-11 sm:py-4 rounded-full bg-white text-black font-medium text-sm sm:text-base tracking-wide hover:scale-105 transition-transform duration-200 cursor-pointer"
        >
          Launch Demo Mode
        </button>

        {/* Footer Text: 'Enterprise Grade Security' */}
        <span className="text-[11px] sm:text-xs font-mono text-neutral-600 tracking-wider select-none">
          Enterprise Grade Security
        </span>
      </div>
    </section>
  );
}
