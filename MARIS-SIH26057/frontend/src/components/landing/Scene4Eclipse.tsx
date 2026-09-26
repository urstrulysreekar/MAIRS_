'use client';

import React from 'react';

const HAZARD_CLASSES = [
  {
    id: 'ghost_net',
    name: 'Ghost Nets',
    code: 'HZ-NET',
    desc: 'Abandoned monofilament & trawl netting snagged on reef beds.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 6.375a1.5 1.5 0 0 0 1.299 2.25h16.008a1.5 1.5 0 0 0 1.3-2.25L13.3 3.375a1.5 1.5 0 0 0-2.6 0L2.697 19.125zM12 18h.008v.008H12V18z" />
      </svg>
    ),
  },
  {
    id: 'wreck_debris',
    name: 'Wreck Debris',
    code: 'HZ-WRECK',
    desc: 'Metallic hull fragments, submerged containers & historic hulls.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
  },
  {
    id: 'uxo',
    name: 'UXO Munitions',
    code: 'HZ-UXO',
    desc: 'Unexploded naval ordnance, sea mines & legacy munitions.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3M3 12h3m12 0h3" />
      </svg>
    ),
  },
  {
    id: 'pipeline',
    name: 'Subsea Pipelines',
    code: 'HZ-PIPE',
    desc: 'Exposed subsea cables, oil conduits & free-spanning pipelines.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>
    ),
  },
  {
    id: 'geological',
    name: 'Biogenic / Geo',
    code: 'HZ-GEO',
    desc: 'Hard-bottom reef outcroppings, pockmarks & gas seep mounds.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      </svg>
    ),
  },
];

export default function Scene4Eclipse() {
  return (
    <section id="eclipse-classes" className="relative min-h-screen py-24 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col justify-center items-center text-center text-[#EDEBFF]">
      {/* Category Pill */}
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0A0A2C]/60 px-3 py-1 font-mono-inst text-[10px] uppercase tracking-widest text-[#C7B6FF] mb-6">
        <span>ACOUSTIC SHADOW DECOMPOSITION</span>
      </div>

      {/* Heading */}
      <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#EDEBFF] leading-tight uppercase max-w-3xl">
        Every object leaves a shadow.
      </h2>

      {/* Dim Paragraph */}
      <p className="mt-4 text-sm sm:text-base text-[rgba(200,196,255,0.6)] max-w-2xl leading-relaxed">
        High-frequency side-scan sonar highlights protruding seabed features while projecting an acoustic shadow. MARIS models both intensity specularities and shadow geometry to distinguish critical hazards from seafloor topography.
      </p>

      {/* Row of 5 Small Glass Tiles representing MARIS_CLASSES */}
      <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 w-full text-left font-mono-inst">
        {HAZARD_CLASSES.map((hc) => (
          <div
            key={hc.id}
            className="rounded-xl border border-white/10 bg-[#0A0A2C]/40 backdrop-blur-xl p-4.5 space-y-2.5 transition-all hover:border-white/30 hover:bg-[#0A0A2C]/70 group"
          >
            <div className="flex items-center justify-between text-[#C7B6FF] group-hover:text-white transition-colors">
              <div className="p-2 rounded-lg bg-[#040313] border border-white/10">
                {hc.icon}
              </div>
              <span className="text-[10px] font-bold text-[#8c978f]">{hc.code}</span>
            </div>

            <h3 className="text-sm font-bold text-[#EDEBFF] uppercase truncate mt-2">
              {hc.name}
            </h3>

            <p className="text-[11px] text-[rgba(200,196,255,0.6)] leading-snug">
              {hc.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
