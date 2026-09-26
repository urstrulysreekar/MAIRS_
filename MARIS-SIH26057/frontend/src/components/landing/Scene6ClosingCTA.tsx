'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Scene6ClosingCTA() {
  const router = useRouter();

  return (
    <section className="relative min-h-[90vh] py-28 px-4 sm:px-8 max-w-5xl mx-auto flex flex-col justify-between items-center text-center text-[#EDEBFF]">
      {/* Category Pill & Closing Heading */}
      <div className="space-y-6 max-w-2xl my-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0A0A2C]/60 px-3 py-1 font-mono-inst text-[10px] uppercase tracking-widest text-[#C7B6FF]">
          <span>OPERATIONAL MISSION READINESS</span>
        </div>

        <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#EDEBFF] leading-tight uppercase">
          Ready to review today&apos;s detections?
        </h2>

        <p className="text-sm sm:text-base text-[rgba(200,196,255,0.6)] leading-relaxed max-w-lg mx-auto">
          Launch the operations console to inspect raw side-scan waterfall swaths, audit geolocated hazard boundaries, and generate signed hydrographic dossiers.
        </p>

        {/* CTA Controls: Open console Pill */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/console')}
            className="rounded-full bg-[#F3F2FA] text-[#040313] px-8 py-3.5 text-sm font-bold uppercase tracking-wider hover:bg-white hover:shadow-[0_0_25px_rgba(243,242,250,0.6)] transition-all cursor-pointer"
          >
            Open console
          </button>

          <Link
            href="/map"
            className="rounded-full border border-white/20 bg-[#0A0A2C]/60 px-6 py-3.5 text-sm font-semibold text-[#EDEBFF] hover:border-white/50 hover:bg-[#0A0A2C] transition-colors"
          >
            Explore PostGIS Map &rarr;
          </Link>
        </div>
      </div>

      {/* Device Rising Preview Silhouette with Globe Glow */}
      <div className="relative w-full max-w-xl mt-12 rounded-t-[2.5rem] border-t border-x border-white/15 bg-gradient-to-b from-[#0A0A2C]/80 to-[#040313] p-6 pb-0 overflow-hidden shadow-[0_-20px_50px_rgba(123,61,255,0.25)]">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 font-mono-inst text-xs text-[#8c978f]">
          <span className="flex items-center gap-2 text-[#5b937c]">
            <span className="h-2 w-2 rounded-full bg-[#5b937c]" />
            MARIS C2 REAL-TIME LINK: ACTIVE
          </span>
          <span className="text-[#C7B6FF]">SIH26057 / EPSG:4326</span>
        </div>

        <div className="py-6 flex justify-between items-center font-mono-inst text-xs">
          <div className="text-left">
            <span className="text-[10px] text-[rgba(200,196,255,0.5)] block">INGESTED SWATH FILE</span>
            <span className="text-[#EDEBFF] font-bold truncate max-w-[200px] block">
              MARIS_GULF_OF_MANNAR_SURVEY_01_RAW_LOG
            </span>
          </div>
          <button
            onClick={() => router.push('/console')}
            className="text-[#C7B6FF] hover:text-white font-bold underline text-[11px]"
          >
            View Live Stream →
          </button>
        </div>

        {/* Bottom Ambient Glow */}
        <div className="h-10 bg-gradient-to-t from-[#7B3DFF]/40 to-transparent rounded-t-xl" />
      </div>
    </section>
  );
}
