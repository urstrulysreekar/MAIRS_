'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function Scene1Hero() {
  const router = useRouter();

  return (
    <section className="relative w-full h-screen flex flex-col justify-between items-center pt-28 pb-10 px-4 select-none">
      {/* Top Spacer for Floating Navbar */}
      <div className="h-6" />

      {/* Massive Overlaid Typography: Ultra-Bold "M A R I S" */}
      <div className="flex-1 flex items-center justify-center w-full my-auto">
        <h1
          className="text-6xl sm:text-8xl md:text-9xl lg:text-[13rem] font-black tracking-[0.38em] sm:tracking-[0.45em] text-[#EDEBFF] uppercase text-center pl-[0.38em] sm:pl-[0.45em] select-none drop-shadow-[0_20px_50px_rgba(4,3,19,0.9)] opacity-95 transition-transform"
          style={{
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          MARIS
        </h1>
      </div>

      {/* Hero Bottom Elements: Tagline, Security Badge, CTA, and Scroll Indicator */}
      <div className="flex flex-col items-center text-center gap-3 max-w-md w-full z-10">
        {/* Tagline */}
        <p className="font-mono-inst text-xs sm:text-sm font-bold tracking-[0.3em] text-[#EDEBFF] uppercase">
          AI THAT SIMPLY WORKS
        </p>

        {/* Microcopy with Status Indicator */}
        <div className="flex items-center gap-2 font-mono-inst text-[11px] text-[rgba(200,196,255,0.7)] tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5b937c]" />
          <span>Enterprise Grade Security</span>
        </div>

        {/* White Pill Button: Open console */}
        <button
          type="button"
          onClick={() => router.push('/console')}
          className="mt-2 rounded-full bg-[#F3F2FA] text-[#040313] px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-white hover:shadow-[0_0_20px_rgba(243,242,250,0.5)] transition-all cursor-pointer"
        >
          Open console
        </button>

        {/* Bouncing Scroll Down Indicator */}
        <div className="pt-6 flex flex-col items-center">
          <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono-inst animate-bounce flex items-center gap-1.5">
            SCROLL DOWN ↓
          </span>
        </div>
      </div>
    </section>
  );
}
