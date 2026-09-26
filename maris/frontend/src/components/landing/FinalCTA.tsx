'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function FinalCTA() {
  const router = useRouter();

  return (
    <section className="relative py-24 px-4 sm:px-8 bg-[#070a0f] text-[#e2e8e4] text-center border-b border-white/[0.08]">
      <div className="relative z-10 max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 border border-white/[0.12] bg-[#101622] px-2.5 py-1 font-mono-inst text-[10px] uppercase tracking-widest text-[#8c978f]">
          <span>EVALUATION ENVIRONMENT : ZERO CLOUD DEPENDENCY</span>
        </div>

        <h2 className="font-editorial text-3xl sm:text-5xl font-normal text-[#e2e8e4] tracking-tight leading-tight">
          Evaluate MARIS on active hydrographic survey corridors.
        </h2>

        <p className="text-sm sm:text-base text-[#8c978f] leading-relaxed max-w-xl mx-auto font-sans">
          Access the operations console with seeded multi-beam sonar surveys, real-time PostGIS spatial mapping, and certified hydrographic report generation.
        </p>

        {/* Crisp Architectural Action Block */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4 font-mono-inst text-xs">
          <button
            type="button"
            onClick={() => router.push('/console')}
            className="border border-[#e2e8e4] bg-[#e2e8e4] text-[#070a0f] px-6 py-3 font-semibold transition-colors hover:bg-transparent hover:text-[#e2e8e4]"
          >
            ENTER OPERATIONS CONSOLE [C2]
          </button>

          <button
            type="button"
            onClick={() => router.push('/reports')}
            className="border border-white/20 bg-[#101622] text-[#e2e8e4] px-6 py-3 transition-colors hover:border-white/50 hover:bg-[#161e2e]"
          >
            INSPECT SURVEY DOSSIERS
          </button>
        </div>

        <div className="font-mono-inst text-[11px] text-[#8c978f] pt-2">
          Deterministic PRNG Seed: 26057 | Offline Capable
        </div>
      </div>
    </section>
  );
}
