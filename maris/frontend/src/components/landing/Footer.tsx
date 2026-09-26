'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [modalContent, setModalContent] = useState<'tos' | 'privacy' | null>(null);

  return (
    <footer className="relative border-t border-white/[0.08] bg-[#070a0f] text-[#e2e8e4] py-12 px-4 sm:px-8 font-mono-inst">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Main Footer Grid */}
        <div className="grid md:grid-cols-12 gap-8 items-start">
          {/* Brand & Mandate */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 border border-[#8c978f] flex items-center justify-center bg-[#101622]">
                <div className="h-1.5 w-1.5 bg-[#e2e8e4]" />
              </div>
              <span className="text-xs font-semibold tracking-[0.2em] text-[#e2e8e4] uppercase">
                MARIS C2 SYSTEM
              </span>
              <span className="text-[10px] text-[#8c978f] border border-white/10 px-2 py-0.5">
                SIH26057
              </span>
            </div>
            <p className="text-xs text-[#8c978f] leading-relaxed max-w-md font-sans">
              Marine Anomaly Recognition and Geodetic Intelligence System. High-fidelity acoustic telemetry processing for autonomous underwater hazard interdiction.
            </p>
          </div>

          {/* Navigation Matrix */}
          <div className="md:col-span-4 grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div className="text-[10px] text-[#8c978f] uppercase tracking-wider">COMMAND VIEWS</div>
              <ul className="space-y-1 text-[#e2e8e4]">
                <li><Link href="/console" className="hover:text-white transition-colors">Operations Console</Link></li>
                <li><Link href="/map" className="hover:text-white transition-colors">PostGIS Swath Map</Link></li>
                <li><Link href="/upload" className="hover:text-white transition-colors">Sonar Ingestion</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] text-[#8c978f] uppercase tracking-wider">DATA ASSETS</div>
              <ul className="space-y-1 text-[#e2e8e4]">
                <li><Link href="/anomalies" className="hover:text-white transition-colors">Target Inventory</Link></li>
                <li><Link href="/reports" className="hover:text-white transition-colors">Survey Dossiers</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Analyst Portal</Link></li>
              </ul>
            </div>
          </div>

          {/* Institutional Compliance & Governance */}
          <div className="md:col-span-3 space-y-2 text-xs text-[#8c978f]">
            <div className="text-[10px] uppercase tracking-wider text-[#e2e8e4]">HYDROGRAPHIC COMPLIANCE</div>
            <div className="text-[11px] leading-snug">
              Developed for Smart India Hackathon. Aligned with Ministry of Earth Sciences (MoES) and INCOIS hydrographic data specifications.
            </div>
            <div className="pt-2 flex items-center gap-4 text-[11px] text-[#e2e8e4]">
              <button
                type="button"
                onClick={() => setModalContent('tos')}
                className="underline underline-offset-4 hover:text-[#5b937c] transition-colors"
              >
                Terms of Operation
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={() => setModalContent('privacy')}
                className="underline underline-offset-4 hover:text-[#5b937c] transition-colors"
              >
                Data Privacy Policy
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Hairline & Legal Bar */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4 text-[11px] text-[#8c978f]">
          <div>
            &copy; 2026 MARIS Technical Consortium. All acoustic telemetry models open for authorized defense evaluation.
          </div>
          <div className="flex items-center gap-3">
            <span>CRS: EPSG:4326 (WGS84)</span>
            <span>•</span>
            <span className="text-[#5b937c]">SECURITY PROTOCOL: NOMINAL</span>
          </div>
        </div>
      </div>

      {/* ── Operational Terms / Privacy Policy Modal Dialog ── */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 font-mono-inst">
          <div className="w-full max-w-2xl border border-white/20 bg-[#0b1018] p-6 text-[#e2e8e4] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#e2e8e4]">
                {modalContent === 'tos' ? 'OPERATIONAL TERMS OF SERVICE [MARIS-TOS-2026]' : 'HYDROGRAPHIC DATA PRIVACY & SOVEREIGNTY POLICY'}
              </h3>
              <button
                type="button"
                onClick={() => setModalContent(null)}
                className="px-2 py-0.5 border border-white/20 text-xs hover:bg-white/10"
              >
                CLOSE [ESC]
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3 text-xs text-[#8c978f] leading-relaxed font-sans pr-2">
              {modalContent === 'tos' ? (
                <>
                  <p>
                    <strong>1. Authorization:</strong> Access to the MARIS C2 Operations Console and acoustic sensor telemetry is restricted to credentialed hydrographic analysts and authorized defense personnel.
                  </p>
                  <p>
                    <strong>2. Sensor Geotagging Accuracy:</strong> Autonomous bounding boxes, centroid coordinates, and PostGIS geometries generated by YOLOv8-DySample are intended for operational tactical interdiction and must undergo standard human-in-the-loop validation before dredging or munitions neutralization.
                  </p>
                  <p>
                    <strong>3. Cryptographic Verification:</strong> All exported hydrographic dossiers are sealed with SHA-256 telemetry hashes. Alteration of binary raw logs invalidates field sign-off compliance.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>1. Sovereign Bathymetric Data:</strong> Raw sidescan (.XTF, .JSF) and multi-beam acoustic survey payloads ingested into MARIS are processed strictly within local national computational boundaries under Indian Geodetic Regulations.
                  </p>
                  <p>
                    <strong>2. Telemetry Retention:</strong> AIS vessel vectors and acoustic ping headers are stored in encrypted PostGIS schemas with role-based access control (RBAC). No raw sensor data is transmitted to unauthorized third-party commercial cloud providers.
                  </p>
                </>
              )}
            </div>

            <div className="border-t border-white/10 pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setModalContent(null)}
                className="border border-[#e2e8e4] bg-[#e2e8e4] text-[#070a0f] px-4 py-1.5 text-xs font-semibold hover:bg-transparent hover:text-[#e2e8e4]"
              >
                ACKNOWLEDGE &amp; RETURN
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
