'use client';

import React, { useState } from 'react';

export default function Scene3DataProtection() {
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified'>('idle');
  const [sampleHash] = useState('0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

  const handleVerify = () => {
    setVerificationStatus('verifying');
    setTimeout(() => {
      setVerificationStatus('verified');
    }, 850);
  };

  return (
    <section id="data-protection" className="relative min-h-screen py-24 px-4 sm:px-8 max-w-5xl mx-auto flex flex-col justify-center items-center text-center text-[#EDEBFF]">
      {/* Category Pill */}
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0A0A2C]/60 px-3 py-1 font-mono-inst text-[10px] uppercase tracking-widest text-[#C7B6FF] mb-6">
        <span>TAMPER-EVIDENT EVIDENCE</span>
      </div>

      {/* Centered Heading */}
      <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-[#EDEBFF] leading-tight uppercase max-w-3xl">
        Cryptographic Chain of Custody &amp; Data Protection
      </h2>

      {/* Dim Paragraph */}
      <p className="mt-4 text-sm sm:text-base text-[rgba(200,196,255,0.6)] max-w-2xl leading-relaxed">
        Every acoustic target coordinate, bounding polygon, and classified snippet is signed directly by the edge sensor hardware using immutable SHA-256 cryptographic hashes.
      </p>

      {/* Two Low-Contrast Glass Cards */}
      <div className="mt-12 grid sm:grid-cols-2 gap-6 w-full max-w-3xl text-left font-mono-inst">
        {/* Card 1: SHA-256 sealed GeoJSON/CSV */}
        <div className="rounded-2xl border border-white/10 bg-[#0A0A2C]/40 backdrop-blur-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#EDEBFF] uppercase">SHA-256 sealed GeoJSON/CSV</span>
            <span className="h-2 w-2 rounded-full bg-[#5b937c]" />
          </div>
          <p className="text-[11px] text-[rgba(200,196,255,0.6)] leading-relaxed">
            Immutable export bundles formatted for QGIS, ESRI ArcGIS, and PostGIS geodatabases with embedded cryptographic checksums.
          </p>
          <div className="pt-2">
            <span className="rounded bg-[#040313] border border-white/10 px-2.5 py-1 text-[10px] text-[#C7B6FF] block truncate">
              HASH: {sampleHash}
            </span>
          </div>
        </div>

        {/* Card 2: Verify any report with interactive button */}
        <div className="rounded-2xl border border-white/10 bg-[#0A0A2C]/40 backdrop-blur-xl p-6 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#EDEBFF] uppercase">Verify Any Report</span>
              <span className="text-[10px] text-[#C7B6FF]">REST API v1</span>
            </div>
            <p className="text-[11px] text-[rgba(200,196,255,0.6)] leading-relaxed mt-2">
              Instantly validate the integrity of any generated hydrographic assessment docket against on-chain merkle roots.
            </p>
          </div>

          <div className="pt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={handleVerify}
              disabled={verificationStatus === 'verifying'}
              className="rounded-full bg-[#F3F2FA] text-[#040313] px-4 py-1.5 text-xs font-bold hover:bg-white hover:shadow-[0_0_15px_rgba(243,242,250,0.4)] transition-all cursor-pointer disabled:opacity-50"
            >
              {verificationStatus === 'verifying'
                ? 'Verifying...'
                : verificationStatus === 'verified'
                ? '✓ Re-Verify'
                : 'Verify Report'}
            </button>

            {verificationStatus === 'verified' && (
              <span className="rounded-full bg-[#5b937c]/20 border border-[#5b937c]/40 text-[#5b937c] px-3 py-0.5 text-[10px] font-bold animate-fade-in">
                SEAL VALID: EPSG:4326
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
