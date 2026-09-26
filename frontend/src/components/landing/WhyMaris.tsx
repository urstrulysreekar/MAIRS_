'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Activity, Compass, ArrowUpRight, Zap } from 'lucide-react';
import Link from 'next/link';

export default function WhyMaris() {
  const cards = [
    {
      icon: ShieldAlert,
      title: 'Ghost Nets Isolated',
      subtitle: '96.4% mAP50 Precision',
      desc: 'Derelict synthetic polyamide netting recognized amidst complex benthic reefs through multi-frequency acoustic backscatter contrast and 5-channel GLCM texture tensors.',
      metric: '0.42m Precision',
      tag: 'CRITICAL HAZARD',
      color: '#00f0ff',
      borderGlow: 'hover:border-cyan-400/60',
    },
    {
      icon: Activity,
      title: 'UNDROIP Motion Mosaics',
      subtitle: '6-DOF Attitude Compensation',
      desc: 'Real-time IMU fusion removes vessel heave, pitch, and roll artifacts with automated 2D-FFT de-striping, producing seamless georeferenced seabed bathymetry.',
      metric: '14.2ms FP16 Latency',
      tag: 'EDGE ACCELERATED',
      color: '#38bdf8',
      borderGlow: 'hover:border-sky-400/60',
    },
    {
      icon: Compass,
      title: 'Sub-Meter PostGIS Geotagging',
      subtitle: 'USBL + DVL Acoustic Fusion',
      desc: 'Autonomous positioning pins every detected hazard to global WGS84 coordinates (SRID:4326), exporting actionable polygon geometries for clearance vessels.',
      metric: '±0.38m Error Margin',
      tag: 'DEFENSE GRADE',
      color: '#0ac5b2',
      borderGlow: 'hover:border-teal-400/60',
    },
  ];

  return (
    <section id="why" className="relative py-28 px-6 max-w-7xl mx-auto text-white">
      {/* Section Header */}
      <div className="space-y-4 max-w-3xl mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0c1022]/80 px-3.5 py-1 text-xs font-mono font-medium text-cyan-400 backdrop-blur-md">
          <Zap className="h-3.5 w-3.5" />
          <span>AUTONOMOUS SUBSEA DEFENSE · WHY MARIS</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          Engineered for Zero Acoustic Blindspots
        </h2>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Traditional hydrographic side-scan surveys require hours of post-mission human review.
          MARIS executes real-time edge AI inference directly onboard Autonomous Underwater Vehicles.
        </p>
      </div>

      {/* 3 Glass Cards Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative rounded-2xl border border-white/[0.08] bg-[#0c1124]/70 p-8 backdrop-blur-2xl transition-all duration-300 ${card.borderGlow} hover:shadow-[0_0_40px_rgba(0,240,255,0.15)] hover:-translate-y-1 flex flex-col justify-between`}
            >
              {/* Card Header */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.05] border border-white/10 text-cyan-400 group-hover:scale-110 group-hover:border-cyan-400/50 transition-all duration-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-[10px] font-bold tracking-widest text-slate-400 border border-white/10 px-2.5 py-0.5 rounded-full">
                    {card.tag}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-space text-xl font-black text-white group-hover:text-cyan-300 transition-colors">
                    {card.title}
                  </h3>
                  <p className="font-mono text-xs font-semibold text-cyan-400">
                    {card.subtitle}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              {/* Card Footer Metric */}
              <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between font-mono text-xs">
                <span className="text-slate-400">Operational Metric</span>
                <span className="font-black text-white">{card.metric}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
