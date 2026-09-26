'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useKPIMetrics, useFilteredAnomalies } from '@/lib/demo';

export default function StatsBand() {
  const kpi = useKPIMetrics();
  const { anomalies } = useFilteredAnomalies();

  const stats = [
    {
      num: `${anomalies.length}`,
      label: 'Anomalies Detected',
      sub: 'Ghost nets, UXO & wrecks',
      color: 'text-cyan-400',
    },
    {
      num: `${kpi.totalSurveys}`,
      label: 'Surveys Processed',
      sub: 'XTF / JSF sonar files',
      color: 'text-sky-400',
    },
    {
      num: `${kpi.totalAreaCoveredKm2}`,
      label: 'Area Covered (km²)',
      sub: '200m swath bathymetry',
      color: 'text-purple-400',
    },
    {
      num: `${(kpi.avgConfidence * 100).toFixed(1)}%`,
      label: 'Detection Confidence',
      sub: 'mAP50 DySample precision',
      color: 'text-amber-300',
    },
  ];

  return (
    <section className="relative py-20 border-y border-white/10 bg-[#060914] text-white">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((st, idx) => (
          <motion.div
            key={st.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className="flex flex-col space-y-1.5"
          >
            <span
              suppressHydrationWarning
              className={`font-syncopate text-3xl sm:text-5xl font-black ${st.color}`}
            >
              {st.num}
            </span>
            <span className="font-space font-bold text-sm sm:text-base text-white">
              {st.label}
            </span>
            <span className="font-mono text-xs text-slate-400">
              {st.sub}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
