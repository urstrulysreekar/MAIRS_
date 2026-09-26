'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#020208] text-white py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-syncopate font-bold text-base tracking-widest text-white">
              MARIS
            </span>
            <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/50 border border-cyan-500/30 px-2 py-0.5 rounded-full">
              SIH26057
            </span>
          </div>
          <p className="font-mono text-xs text-slate-400">
            Marine Anomaly Recognition &amp; Intelligence System
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 font-space text-xs text-slate-300">
          <Link href="/console" className="hover:text-cyan-400 transition-colors">Operations Console</Link>
          <Link href="/map" className="hover:text-cyan-400 transition-colors">PostGIS Map</Link>
          <Link href="/upload" className="hover:text-cyan-400 transition-colors">Ingestion</Link>
          <Link href="/anomalies" className="hover:text-cyan-400 transition-colors">Target Inventory</Link>
          <Link href="/reports" className="hover:text-cyan-400 transition-colors">Survey Reports</Link>
          <Link href="/login" className="hover:text-cyan-400 transition-colors">Analyst Auth</Link>
        </div>

        {/* Copyright */}
        <div className="font-mono text-[11px] text-slate-400 text-center md:text-right">
          Smart India Hackathon 2024 · Ministry of Earth Sciences
        </div>
      </div>
    </footer>
  );
}
