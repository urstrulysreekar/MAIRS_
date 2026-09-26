'use client';

import React from 'react';
import Link from 'next/link';

export default function HazardTaxonomy() {
  const hazards = [
    {
      code: 'HZ-NET',
      title: 'Polyamide Ghost Nets',
      desc: 'Derelict synthetic commercial gillnets and trawls snagged on coral formations. Identified through high-frequency acoustic mesh lattice diffraction and shadow length analysis.',
      precision: '96.4%',
      signature: 'Lattice Backscatter Diffraction',
      status: 'CRITICAL HAZARD',
      statusColor: 'text-[#d93829] border-[#d93829]/40 bg-[#d93829]/10',
    },
    {
      code: 'HZ-WRECK',
      title: 'Wreckage & Hull Fragments',
      desc: 'Sunken vessel structures creating navigational obstructions. High acoustic reflectivity with extended geometric acoustic shadow projection.',
      precision: '94.8%',
      signature: 'Specular Boundary Edge',
      status: 'HIGH HAZARD',
      statusColor: 'text-[#d99b26] border-[#d99b26]/40 bg-[#d99b26]/10',
    },
    {
      code: 'HZ-UXO',
      title: 'UXO & Naval Munitions',
      desc: 'Unexploded naval ordnance, artillery shells, and sea mines. Dense metallic cylindrical acoustic signature with sharp specular point flares.',
      precision: '93.1%',
      signature: 'Specular Point Reflection',
      status: 'CRITICAL HAZARD',
      statusColor: 'text-[#d93829] border-[#d93829]/40 bg-[#d93829]/10',
    },
    {
      code: 'HZ-PIPE',
      title: 'Subsea Cables & Pipelines',
      desc: 'Critical offshore energy pipelines and fiber-optic communication lines. Linear continuous contour tracking isolating spans, scouring, and anchor damage.',
      precision: '97.2%',
      signature: 'Linear Continuous Ridge',
      status: 'MONITORED INFRASTRUCTURE',
      statusColor: 'text-[#5b937c] border-[#5b937c]/40 bg-[#5b937c]/10',
    },
    {
      code: 'HZ-BIO',
      title: 'Coral Reefs & Marine Flora',
      desc: 'Protected benthic marine ecosystems requiring conservation zoning. Diffuse organic acoustic reflectance with high multi-frequency texture entropy.',
      precision: '91.5%',
      signature: 'Diffuse Organic Entropy',
      status: 'PROTECTED BENTHIC',
      statusColor: 'text-[#5b937c] border-[#5b937c]/40 bg-[#5b937c]/10',
    },
    {
      code: 'HZ-GEO',
      title: 'Bedrock & Boulder Fields',
      desc: 'Natural seabed rock outcrops and sediment ripples. Serves as reference acoustic baseline to reduce false-positive hazard classifications.',
      precision: '95.6%',
      signature: 'Geological Baseline',
      status: 'NATURAL SEABED',
      statusColor: 'text-[#8c978f] border-white/20 bg-white/[0.04]',
    },
  ];

  return (
    <section id="taxonomy" className="relative py-20 px-4 sm:px-8 max-w-7xl mx-auto text-[#e2e8e4] border-b border-white/[0.08]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 border border-white/[0.12] bg-[#101622] px-2.5 py-1 font-mono-inst text-[10px] uppercase tracking-widest text-[#8c978f]">
            <span>HAZARD TAXONOMY CATALOG</span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-5xl font-normal tracking-tight text-[#e2e8e4] leading-tight">
            Six-class acoustic hazard taxonomy.
          </h2>
          <p className="text-sm sm:text-base text-[#8c978f] leading-relaxed">
            Trained on verified NOAA and Indian hydrographic survey datasets, MARIS discriminates synthetic debris from natural geological formations.
          </p>
        </div>

        <Link
          href="/anomalies"
          className="font-mono-inst text-xs font-semibold text-[#e2e8e4] hover:text-[#5b937c] transition-colors shrink-0 underline underline-offset-4"
        >
          VIEW TARGET INVENTORY [MASTER TABLE]
        </Link>
      </div>

      {/* 6 Structural Catalog Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono-inst">
        {hazards.map((hz) => (
          <div
            key={hz.code}
            className="border border-white/[0.12] bg-[#0b1018] p-5 flex flex-col justify-between space-y-4 transition-colors hover:border-white/30"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#e2e8e4]">{hz.code}</span>
                <span className={`text-[9px] font-semibold border px-2 py-0.5 ${hz.statusColor}`}>
                  {hz.status}
                </span>
              </div>

              <h3 className="font-sans text-base font-semibold text-[#e2e8e4]">
                {hz.title}
              </h3>

              <p className="font-sans text-xs text-[#8c978f] leading-relaxed">
                {hz.desc}
              </p>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px]">
              <span className="text-[#8c978f] text-[10px] truncate max-w-[160px]">{hz.signature}</span>
              <span className="text-[#e2e8e4] font-semibold tabular-nums">mAP50: {hz.precision}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
