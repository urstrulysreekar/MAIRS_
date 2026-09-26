'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, Zap } from 'lucide-react';

export default function FinalCTA() {
  const router = useRouter();

  const handleLaunch = () => {
    router.push('/login');
  };

  return (
    <section className="relative py-36 px-6 overflow-hidden bg-[#03030f] text-white text-center flex flex-col items-center justify-center">
      {/* ── Bottom-Anchored Glowing Eclipse Ring Motif ── */}
      <div className="absolute bottom-[-60vw] sm:bottom-[-40vw] left-1/2 -translate-x-1/2 w-[110vw] sm:w-[85vw] h-[110vw] sm:h-[85vw] pointer-events-none">
        <svg viewBox="0 0 1000 1000" className="w-full h-full overflow-visible" fill="none">
          <defs>
            <filter id="bottomRingGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="24" result="b1" />
              <feGaussianBlur stdDeviation="8" result="b2" />
              <feMerge>
                <feMergeNode in="b1" />
                <feMergeNode in="b2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="bottomRingGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d946ef" stopOpacity="0.9" />
              <stop offset="30%" stopColor="#7c3aed" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#00f0ff" stopOpacity="1" />
              <stop offset="70%" stopColor="#7c3aed" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#d946ef" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          <circle
            cx="500"
            cy="500"
            r="460"
            stroke="url(#bottomRingGrad)"
            strokeWidth="10"
            opacity="0.8"
            filter="url(#bottomRingGlow)"
            style={{ mixBlendMode: 'plus-lighter' }}
          />
          <circle
            cx="500"
            cy="500"
            r="460"
            stroke="#ffffff"
            strokeWidth="2.5"
            opacity="0.95"
            style={{ mixBlendMode: 'plus-lighter' }}
          />
        </svg>
      </div>

      {/* Radial Deep Blue Ambience */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70vw] h-[40vh] rounded-full blur-[100px] bg-cyan-500/15 pointer-events-none" />

      {/* Central Content */}
      <div className="relative z-10 max-w-3xl space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0c1022]/80 px-3.5 py-1 text-xs font-mono font-medium text-cyan-400 backdrop-blur-md">
          <Zap className="h-3.5 w-3.5" />
          <span>AUTONOMOUS RECONNAISSANCE · SIH26057</span>
        </div>

        <h2 className="font-space text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
          Find the net before it finds the reef.
        </h2>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
          Deploy edge AI sonar intelligence across critical Indian maritime corridors.
          Deterministic processing with zero cloud dependencies.
        </p>

        {/* White Pill CTA */}
        <div className="pt-4">
          <button
            onClick={handleLaunch}
            className="group inline-flex items-center justify-center rounded-full bg-white text-[#03030f] font-space font-bold text-base px-10 py-4 shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:bg-slate-100 hover:shadow-[0_0_60px_rgba(255,255,255,0.7)] hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <span>Launch Live Demo</span>
            <ChevronRight className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>

        <p className="font-mono text-xs text-slate-400 pt-2">
          Runs on deterministic demo data · Zero setup required
        </p>
      </div>
    </section>
  );
}
