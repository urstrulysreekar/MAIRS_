'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FloatingNav() {
  const router = useRouter();
  const [lang, setLang] = useState<'EN' | 'IN'>('EN');

  return (
    <div className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-between gap-4 sm:gap-8 rounded-full border border-white/10 bg-[#0A0A2C]/60 backdrop-blur-xl px-5 sm:px-7 py-2.5 shadow-[0_8px_32px_rgba(4,3,19,0.4)] text-xs font-mono-inst text-[#EDEBFF] max-w-5xl w-full">
        {/* Logo Left */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-5 w-5 rounded-full border border-white/20 bg-[#040313] flex items-center justify-center group-hover:border-[#C7B6FF] transition-colors">
            <div className="h-2 w-2 rounded-full bg-[#EDEBFF]" />
          </div>
          <span className="font-bold tracking-[0.25em] text-[#EDEBFF] uppercase text-sm">
            MARIS
          </span>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-[11px] text-[rgba(200,196,255,0.7)]">
          <a href="#why-maris" className="hover:text-[#EDEBFF] transition-colors">
            Why Maris?
          </a>
          <a href="#split-feature" className="hover:text-[#EDEBFF] transition-colors">
            Technology
          </a>
          <a href="#data-protection" className="hover:text-[#EDEBFF] transition-colors">
            Verification
          </a>
          <a href="#eclipse-classes" className="hover:text-[#EDEBFF] transition-colors">
            Taxonomy
          </a>
          <a href="#dotted-globe" className="hover:text-[#EDEBFF] transition-colors">
            Coverage
          </a>
        </div>

        {/* Right Controls: Language + Login + Open Console Pill */}
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => setLang(lang === 'EN' ? 'IN' : 'EN')}
            className="text-[11px] text-[rgba(200,196,255,0.6)] hover:text-[#EDEBFF] transition-colors uppercase px-1"
          >
            {lang}
          </button>

          <Link
            href="/login"
            className="text-[11px] text-[rgba(200,196,255,0.85)] hover:text-[#EDEBFF] transition-colors"
          >
            Login
          </Link>

          {/* White Pill Button: Open console (Strictly NO Install button) */}
          <button
            type="button"
            onClick={() => router.push('/console')}
            className="rounded-full bg-[#F3F2FA] text-[#040313] px-4 py-1.5 text-xs font-semibold hover:bg-white hover:shadow-[0_0_15px_rgba(243,242,250,0.4)] transition-all cursor-pointer whitespace-nowrap"
          >
            Open console
          </button>
        </div>
      </nav>
    </div>
  );
}
