'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export default function HeroEclipse() {
  const router = useRouter();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const [scrolledPast, setScrolledPast] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');

  // Mouse Parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const nx = (e.clientX / innerWidth - 0.5) * 2;
      const ny = (e.clientY / innerHeight - 0.5) * 2;
      setMousePos({ x: nx, y: ny });
    };

    const handleScroll = () => {
      setScrolledPast(window.scrollY > 40);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Magnetic Button Hover
  const handleBtnMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = (e.clientX - centerX) * 0.25;
    const dy = (e.clientY - centerY) * 0.25;
    setBtnOffset({ x: dx, y: dy });
  };

  const handleBtnMouseLeave = () => {
    setBtnOffset({ x: 0, y: 0 });
  };

  const handleLaunch = () => {
    router.push('/login');
  };

  return (
    <section className="relative w-full h-[100svh] min-h-[720px] max-h-[1080px] overflow-hidden bg-[#03030f] text-white flex flex-col justify-between select-none">
      {/* ── 0. Film Grain Texture Overlay ── */}
      <div className="absolute inset-0 pointer-events-none z-30 film-grain opacity-40 mix-blend-overlay" />

      {/* ── 1. Atmosphere & Royal Electric Blue Nebula ── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Core Upper Royal Blue Halo */}
        <div
          className="absolute top-[-8%] left-1/2 -translate-x-1/2 w-[70vw] h-[60vh] rounded-full blur-[100px] opacity-95 transition-transform duration-700 ease-out"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(35, 25, 255, 0.95) 0%, rgba(27, 22, 224, 0.8) 45%, rgba(124, 58, 237, 0.35) 70%, transparent 85%)',
            transform: `translate(-50%, ${mousePos.y * -12}px)`,
          }}
        />

        {/* Outer Cobalt Ambience */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[95vw] h-[75vh] rounded-full blur-[140px] opacity-65 bg-[#120ca0]" />

        {/* Concentric Caustic Ripples Inside the Basin */}
        <div
          className="absolute top-[32%] left-1/2 -translate-x-1/2 w-[34vw] h-[18vh] rounded-full opacity-40 blur-[30px] border border-cyan-400/40"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0, 240, 255, 0.3) 0%, rgba(42, 28, 255, 0.1) 60%, transparent 90%)',
          }}
        />
        <div className="absolute top-[38%] left-1/2 -translate-x-1/2 w-[22vw] h-[11vh] rounded-full opacity-30 blur-[20px] border border-violet-400/60" />

        {/* Bottom Obsidian Falloff Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#03030f]/20 to-[#03030f] pointer-events-none" />
      </div>

      {/* ── 2. Floating Dark Glass Capsule Navbar ── */}
      <header className="relative z-40 pt-5 px-4 sm:px-8 max-w-7xl mx-auto w-full flex justify-center">
        <motion.nav
          initial={{ y: -25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-5xl rounded-full border border-white/[0.12] bg-[#0c1022]/65 backdrop-blur-2xl px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
        >
          {/* Brand Logo Capsule */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="rounded-full bg-[#121833] border border-white/10 px-3.5 py-1 flex items-center gap-2 group-hover:border-[#00f0ff]/50 transition-colors">
              <span className="font-syncopate font-bold text-xs tracking-widest text-white">
                MARIS
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff] animate-pulse" />
            </div>
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 font-space text-xs font-medium text-slate-300">
            <a href="#why" className="hover:text-white transition-colors">Why MARIS?</a>
            <a href="#reveal" className="hover:text-white transition-colors">Platform</a>
            <Link href="/map" className="hover:text-white transition-colors">Live Map</Link>
            <a href="#pipeline" className="hover:text-white transition-colors">Pipeline</a>
            <a href="#taxonomy" className="hover:text-white transition-colors">Taxonomy</a>
            <a href="#preview" className="hover:text-white transition-colors">Docs</a>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            <button
              title="Toggle Language (EN / HI)"
              onClick={() => setLanguage((l) => (l === 'EN' ? 'HI' : 'EN'))}
              className="hidden sm:flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#121833]/80 font-space text-[10px] font-bold text-slate-300 hover:text-white hover:border-white/30 transition-colors"
            >
              {language}
            </button>

            <Link
              href="/login"
              className="hidden sm:inline-block font-space text-xs font-medium text-slate-300 hover:text-white px-2 py-1 transition-colors"
            >
              Console
            </Link>

            <button
              onClick={handleLaunch}
              className="rounded-full bg-white text-[#03030f] font-space font-semibold text-xs px-4 sm:px-5 py-2 hover:bg-slate-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] active:scale-95 transition-all"
            >
              Launch Demo
            </button>
          </div>
        </motion.nav>
      </header>

      {/* ── 3. Central Arena: The Symmetrical Eclipse Ring, Comet Swirl & Interwoven Wordmark ── */}
      <div className="relative z-20 flex-1 flex flex-col justify-center items-center w-full">
        {/* ── THE ECLIPSE RING (Huge Vector Arc passing symmetrically across the middle) ── */}
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          style={{
            transform: `translate(${mousePos.x * 8}px, ${mousePos.y * 6}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        >
          <svg
            viewBox="0 0 1440 900"
            className="w-full h-full overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              {/* Heavy Outer Bloom Filter */}
              <filter id="eclipseBloomHeavy" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="32" result="blurHeavy" />
                <feGaussianBlur stdDeviation="14" result="blurMid" />
                <feGaussianBlur stdDeviation="4" result="blurTight" />
                <feMerge>
                  <feMergeNode in="blurHeavy" />
                  <feMergeNode in="blurMid" />
                  <feMergeNode in="blurTight" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Tight Hot Flare Filter */}
              <filter id="coreFlare" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="8" result="blur1" />
                <feGaussianBlur stdDeviation="2" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur1" />
                  <feMergeNode in="blur2" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Comet Flare Filter */}
              <filter id="cometBloom" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="20" result="b1" />
                <feGaussianBlur stdDeviation="8" result="b2" />
                <feMerge>
                  <feMergeNode in="b1" />
                  <feMergeNode in="b2" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Symmetrical Ring Stroke Gradient */}
              <linearGradient id="ringStrokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d946ef" stopOpacity="0.95" />
                <stop offset="12%" stopColor="#ec4899" stopOpacity="0.9" />
                <stop offset="28%" stopColor="#a855f7" stopOpacity="0.85" />
                <stop offset="45%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="55%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="72%" stopColor="#a855f7" stopOpacity="0.85" />
                <stop offset="88%" stopColor="#ec4899" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#d946ef" stopOpacity="0.95" />
              </linearGradient>

              {/* Broad Magenta/Violet Shoulder Flares */}
              <linearGradient id="leftShoulderBloom" x1="0%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#d946ef" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="rightShoulderBloom" x1="100%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#d946ef" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
              </linearGradient>

              {/* Comet Tail Gradient */}
              <linearGradient id="cometTailGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="35%" stopColor="#fb7185" stopOpacity="0.95" />
                <stop offset="70%" stopColor="#d946ef" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Layer 1: Left & Right Massive Shoulder Bloom Halos */}
            <circle
              cx="720"
              cy="-110"
              r="540"
              stroke="url(#leftShoulderBloom)"
              strokeWidth="36"
              opacity="0.7"
              filter="url(#eclipseBloomHeavy)"
              style={{ mixBlendMode: 'plus-lighter' }}
            />
            <circle
              cx="720"
              cy="-110"
              r="540"
              stroke="url(#rightShoulderBloom)"
              strokeWidth="36"
              opacity="0.7"
              filter="url(#eclipseBloomHeavy)"
              style={{ mixBlendMode: 'plus-lighter' }}
            />

            {/* Layer 2: Main Ring Chromatic Bloom */}
            <circle
              cx="720"
              cy="-110"
              r="540"
              stroke="url(#ringStrokeGrad)"
              strokeWidth="10"
              opacity="0.9"
              filter="url(#coreFlare)"
              style={{ mixBlendMode: 'plus-lighter' }}
            />

            {/* Layer 3: Razor-Sharp White-Hot Core Line (2.8px) */}
            <circle
              cx="720"
              cy="-110"
              r="540"
              stroke="#ffffff"
              strokeWidth="2.8"
              opacity="0.98"
              style={{ mixBlendMode: 'plus-lighter' }}
            />

            {/* ── Layer 4: LIQUID LIGHT COMET / SWIRL ON RIGHT ARC ── */}
            <g
              transform="translate(860, 310)"
              filter="url(#cometBloom)"
              style={{ mixBlendMode: 'plus-lighter' }}
            >
              {/* Sweeping Liquid Curved Streak along Inner Contour */}
              <motion.path
                d="M 0 110 C 60 90 120 40 145 -30 C 135 15 85 85 10 115 Z"
                fill="url(#cometTailGrad)"
                animate={{
                  opacity: [0.85, 1, 0.85],
                  scale: [1, 1.04, 1],
                  rotate: [0, 2, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              {/* Hot White Comet Head Nucleus */}
              <circle cx="10" cy="112" r="14" fill="#ffffff" filter="url(#coreFlare)" opacity="0.95" />
              <circle cx="10" cy="112" r="5" fill="#ffffff" />
            </g>
          </svg>
        </div>

        {/* ── THE GIANT 5-LETTER WORDMARK: M   A   R   I   S ── */}
        <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-12 z-10">
          <h2 className="sr-only">MARIS</h2>
          <div
            aria-hidden="true"
            className="flex items-center justify-between w-full font-syncopate font-bold text-white tracking-tighter"
            style={{
              fontSize: 'clamp(2.8rem, 9.6vw, 10.5rem)',
              lineHeight: 1,
              textShadow: '0 0 30px rgba(0, 240, 255, 0.2), 0 0 70px rgba(42, 28, 255, 0.35)',
              transform: `translate(${mousePos.x * 5}px, ${mousePos.y * 3}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          >
            {/* 5 Letters Spaced Out */}
            <motion.span
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block transition-transform duration-300 hover:text-cyan-300"
            >
              M
            </motion.span>

            <motion.span
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block transition-transform duration-300 hover:text-cyan-300"
            >
              A
            </motion.span>

            <motion.span
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block relative transition-transform duration-300 hover:text-cyan-300"
            >
              R
            </motion.span>

            <motion.span
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block relative transition-transform duration-300 hover:text-cyan-300"
            >
              I
              {/* Phosphor Glowing Dot over I */}
              <span className="absolute -top-1 sm:-top-2.5 left-1/2 -translate-x-1/2 h-2 sm:h-3 w-2 sm:w-3 rounded-full bg-[#00f0ff] shadow-[0_0_12px_#00f0ff]" />
            </motion.span>

            <motion.span
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block transition-transform duration-300 hover:text-cyan-300"
            >
              S
            </motion.span>
          </div>
        </div>

        {/* ── 4. Hero Subtitle Headline, White Pill CTA & Trust Line ── */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-30 mt-8 sm:mt-12 flex flex-col items-center text-center px-4 space-y-4"
        >
          {/* SIH Pill Tag */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0c1022]/80 px-3 py-0.5 text-[10px] font-mono font-medium text-slate-300 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SIH26057 · AUTONOMOUS EDGE SONAR INTELLIGENCE
          </div>

          {/* Uppercase Headline */}
          <h1 className="font-space font-bold uppercase tracking-[0.25em] text-white text-[clamp(14px,1.6vw,22px)] max-w-2xl">
            SEE WHAT THE SEA HIDES.
          </h1>

          {/* Solid White Pill CTA Button with Magnetic Hover */}
          <div className="pt-1">
            <motion.button
              ref={btnRef}
              onMouseMove={handleBtnMouseMove}
              onMouseLeave={handleBtnMouseLeave}
              animate={{ x: btnOffset.x, y: btnOffset.y }}
              transition={{ type: 'spring', stiffness: 250, damping: 20 }}
              onClick={handleLaunch}
              className="group relative inline-flex items-center justify-center rounded-full bg-white text-[#03030f] font-space font-bold text-sm sm:text-base px-8 sm:px-10 py-3.5 sm:py-4 shadow-[0_0_35px_rgba(255,255,255,0.35)] hover:bg-slate-100 hover:shadow-[0_0_55px_rgba(255,255,255,0.65)] active:scale-95 transition-shadow duration-200"
            >
              <span>Launch Live Demo</span>
              <ChevronRight className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </motion.button>
          </div>

          {/* Muted Trust Line */}
          <p className="font-mono text-[10px] sm:text-[11px] text-slate-400 tracking-wider">
            Runs on demo data · Zero install · Sub-meter PostGIS geotagging
          </p>
        </motion.div>
      </div>

      {/* ── 5. Hero Scroll Cue (Part 2.A) ── */}
      <motion.div
        animate={{
          opacity: scrolledPast ? 0 : 0.75,
          y: scrolledPast ? 12 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="relative z-20 pb-6 flex flex-col items-center gap-2 pointer-events-none"
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/60">
          SCROLL
        </span>
        <div className="relative h-12 w-px bg-white/15 overflow-hidden">
          <motion.div
            animate={{ y: [-12, 48] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="h-3 w-full bg-gradient-to-b from-transparent via-[#00f0ff] to-white"
          />
        </div>
      </motion.div>
    </section>
  );
}
