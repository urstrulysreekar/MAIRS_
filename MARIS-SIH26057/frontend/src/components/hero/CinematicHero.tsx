'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Dynamically import the 3D Arc scene with SSR disabled
const HeroArc3D = dynamic(() => import('@/components/canvas/HeroCanvas'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[#050018] flex items-center justify-center pointer-events-none">
      <div className="w-80 h-80 rounded-full bg-blue-900/10 animate-pulse blur-3xl" />
    </div>
  ),
});

export default function CinematicHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ctaBlockRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      return;
    }

    const ctx = gsap.context(() => {
      // Pin hero for smooth scroll transition into downstream sections
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=160%',
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
        },
      });

      // Monolith Title and CTA fade out, scale up slightly, and blur out
      tl.to(
        [titleRef.current, ctaBlockRef.current],
        {
          opacity: 0,
          y: -80,
          scale: 1.1,
          filter: 'blur(12px)',
          ease: 'power2.inOut',
          duration: 0.65,
        },
        0
      );

      // Navbar dissolves cleanly
      tl.to(
        navRef.current,
        {
          opacity: 0,
          y: -35,
          filter: 'blur(6px)',
          ease: 'power2.inOut',
          duration: 0.45,
        },
        0.05
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen bg-[#050018] overflow-hidden select-none"
    >
      {/* ── Fixed Transparent Navbar ── */}
      <header
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 pt-5 px-4 sm:px-8 max-w-7xl mx-auto w-full flex items-center justify-between pointer-events-auto transition-opacity duration-300"
      >
        {/* Left: MARIS Wordmark Capsule */}
        <Link
          href="/"
          className="rounded-full border border-white/20 bg-white/[0.06] backdrop-blur-md px-5 py-2 text-xs font-bold tracking-[0.25em] text-white hover:border-white/40 hover:bg-white/[0.1] transition-all"
        >
          MARIS
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-white/75">
          <Link href="#why" className="hover:text-white transition-colors">
            Why Maris?
          </Link>
          <Link href="#cost" className="hover:text-white transition-colors">
            Cost
          </Link>
          <Link href="#support" className="hover:text-white transition-colors">
            Support
          </Link>
          <Link href="#partner" className="hover:text-white transition-colors">
            Become a partner
          </Link>
          <Link href="#blog" className="hover:text-white transition-colors">
            Blog
          </Link>
        </nav>

        {/* Right: Language Toggle & Login Link */}
        <div className="flex items-center gap-4 text-xs">
          <button
            type="button"
            className="rounded-full border border-white/20 bg-white/[0.06] px-3.5 py-1 text-white/80 hover:text-white hover:border-white/40 transition-colors font-mono"
          >
            EN
          </button>

          <Link
            href="/login"
            className="text-white/85 hover:text-white transition-colors px-3.5 py-1.5 font-medium rounded-full hover:bg-white/5 border border-transparent hover:border-white/10"
          >
            Login
          </Link>
        </div>
      </header>

      {/* ── 3D Glowing Arc & Comet Head Canvas ── */}
      <HeroArc3D />

      {/* ── Background Soft Void Ambient Lighting ── */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_40%,_#050018_95%)] z-15" />
      <div className="absolute -bottom-36 right-1/4 w-[45rem] h-[45rem] rounded-full bg-[#102070]/20 blur-[160px] pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] rounded-full bg-[#3856ff]/10 blur-[140px] pointer-events-none z-0" />

      {/* ── Foreground Layout: Center Monolith Typography & Bottom CTA ── */}
      <div
        ref={heroContentRef}
        className="relative z-20 w-full h-full flex flex-col justify-between items-center pt-28 pb-16 px-4 pointer-events-none"
      >
        {/* Massive MARIS Typography - Exactly 5 letters matching the arc curvature */}
        <div className="flex-1 flex items-center justify-center w-full">
          <h1
            ref={titleRef}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-[10.5rem] font-normal tracking-[0.55em] sm:tracking-[0.65em] text-white uppercase text-center pl-[0.55em] sm:pl-[0.65em] select-none mix-blend-screen opacity-95 transition-transform"
            style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontWeight: 400,
              textShadow: '0 0 60px rgba(56, 86, 255, 0.4), 0 0 20px rgba(138, 180, 248, 0.3)',
            }}
          >
            MARIS
          </h1>
        </div>

        {/* Bottom CTA Block */}
        <div
          ref={ctaBlockRef}
          className="flex flex-col items-center text-center gap-2 pointer-events-auto max-w-md w-full"
        >
          <p className="text-xs sm:text-sm font-semibold tracking-[0.3em] text-white/85 uppercase">
            THAT SIMPLY WORKS
          </p>

          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-white/50 tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>Enterprise Grade Security</span>
          </div>
        </div>
      </div>
    </section>
  );
}
