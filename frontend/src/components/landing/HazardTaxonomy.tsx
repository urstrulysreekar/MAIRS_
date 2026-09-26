'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HazardBadge, SeverityPill } from '@/components/ui/Badge';
import { HazardClass } from '@/lib/demo/types';
import Link from 'next/link';

export default function HazardTaxonomy() {
  const hazards: {
    class: HazardClass;
    title: string;
    desc: string;
    precision: string;
    signature: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    color: string;
  }[] = [
    {
      class: 'ghost_net',
      title: 'Polyamide Ghost Nets',
      desc: 'Derelict commercial gillnets and trawls snagged on coral reefs. Identified through high-frequency acoustic mesh lattice diffraction and shadow length.',
      precision: '96.4%',
      signature: 'Lattice Backscatter',
      severity: 'critical',
      color: '#00f0ff',
    },
    {
      class: 'wreck_debris',
      title: 'Wreckage & Hull Fragments',
      desc: 'Historic and modern sunken vessel structures creating navigation channel obstructions. High acoustic contrast with extended acoustic shadow projection.',
      precision: '94.8%',
      signature: 'Hard Structural Edge',
      severity: 'high',
      color: '#38bdf8',
    },
    {
      class: 'uxo',
      title: 'UXO & Naval Munitions',
      desc: 'Unexploded naval ordnance, artillery shells, and sea mines. Dense metallic cylindrical acoustic signature with sharp boundary curvature.',
      precision: '93.1%',
      signature: 'Specular Point Flare',
      severity: 'critical',
      color: '#ff3b5c',
    },
    {
      class: 'pipeline',
      title: 'Subsea Cables & Pipelines',
      desc: 'Critical offshore energy pipelines and fiber-optic communication cables. Linear continuous contour tracking isolating scour, spans, and anchor drag damage.',
      precision: '97.2%',
      signature: 'Linear Continuous Ridge',
      severity: 'medium',
      color: '#a855f7',
    },
    {
      class: 'biological',
      title: 'Coral Reefs & Seagrass',
      desc: 'Protected benthic marine ecosystems requiring conservation zoning. Diffuse organic acoustic reflectance with high multi-frequency texture entropy.',
      precision: '91.5%',
      signature: 'Diffuse Organic Entropy',
      severity: 'low',
      color: '#10b981',
    },
    {
      class: 'geological',
      title: 'Boulders & Bedrock',
      desc: 'Natural seabed rock outcrops and sediment ripples. Serves as reference acoustic baseline to reduce false positive hazard classifications.',
      precision: '95.6%',
      signature: 'Geological Benthic Bed',
      severity: 'low',
      color: '#94a3b8',
    },
  ];

  return (
    <section id="taxonomy" className="relative py-28 px-6 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
        <div className="space-y-4 max-w-2xl">
          <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest">
            HAZARD TAXONOMY CLASSIFIER
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            6 Multi-Spectral Hazard Classes
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Trained on verifiable NOAA and Indian hydrographic sonar surveys, MARIS isolates complex
            man-made threats from natural seabed geology.
          </p>
        </div>

        <Link
          href="/anomalies"
          className="font-mono text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors shrink-0"
        >
          View Full Target Inventory →
        </Link>
      </div>

      {/* 6 Hazard Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {hazards.map((hz, idx) => (
          <motion.div
            key={hz.title}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className="group relative rounded-2xl border border-white/10 bg-[#0c1124]/70 p-6 backdrop-blur-xl hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(0,240,255,0.12)] transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <HazardBadge hazardClass={hz.class} />
                <SeverityPill severity={hz.severity} />
              </div>

              <h3 className="font-space text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                {hz.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                {hz.desc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between font-mono text-[11px]">
              <span className="text-slate-400">{hz.signature}</span>
              <span className="font-bold text-cyan-300">mAP50: {hz.precision}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
