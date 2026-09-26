'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollProgress } from '@/lib/scrollBridge';

// Dynamically import Three.js Hero Canvas with SSR disabled to prevent hydration mismatches
const HeroCanvas = dynamic(() => import('@/components/canvas/HeroCanvas'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[#070a0f] flex items-center justify-center pointer-events-none">
      <div className="w-80 h-80 rounded-full bg-[#101622] animate-pulse blur-3xl" />
    </div>
  ),
});

export default function Hero() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ctaBlockRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [utcTimestamp, setUtcTimestamp] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTimestamp(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      scrollProgress.value = 0;
      return;
    }

    const ctx = gsap.context(() => {
      // Pin hero for ~180% scroll height with smooth scrubbing
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=180%',
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
          onUpdate: (self) => {
            // Write directly to non-reactive singleton bridge
            scrollProgress.value = self.progress;
          },
        },
      });

      // Monolith Title and CTA fade out, scale up slightly, and blur out
      tl.to(
        [titleRef.current, ctaBlockRef.current],
        {
          opacity: 0,
          y: -90,
          scale: 1.1,
          filter: 'blur(12px)',
          ease: 'power2.inOut',
          duration: 0.65,
        },
        0
      );

      // Header dissolves cleanly as sphere scales past viewport
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
      className="relative w-full h-screen bg-[#070a0f] overflow-hidden select-none border-b border-white/[0.08]"
    >
      {/* ── 1. Top Architectural Header Bar (Fixed & Seamless) ── */}
      <header
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/[0.08] bg-[#0b1018]/85 backdrop-blur-md px-4 sm:px-8 py-3 transition-opacity duration-300 pointer-events-auto"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Mark & Geodetic Tracker */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-5 w-5 border border-[#8c978f] flex items-center justify-center bg-[#101622]">
                <div className="h-2 w-2 bg-[#e2e8e4]" />
              </div>
              <span className="font-mono-inst text-xs font-semibold tracking-[0.25em] text-[#e2e8e4] uppercase">
                MARIS
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-2 border-l border-white/[0.08] pl-4 font-mono-inst text-[11px] text-[#8c978f]">
              <span>SIH26057</span>
              <span>/</span>
              <span>HYDROGRAPHIC INTEL</span>
            </div>
          </div>

          {/* Real-time System Telemetry & Console Launch Button */}
          <div className="flex items-center gap-6 font-mono-inst text-[11px]">
            <div className="hidden md:flex items-center gap-3 text-[#8c978f]">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 bg-[#5b937c]" />
                <span>ACOUSTIC LINK: ACTIVE</span>
              </span>
              <span>|</span>
              <span className="tabular-nums text-[#e2e8e4]">{utcTimestamp || '2026-09-26 00:00:00 UTC'}</span>
            </div>

            <button
              type="button"
              onClick={() => router.push('/console')}
              className="border border-white/20 bg-[#101622] px-3.5 py-1.5 font-mono-inst text-xs font-medium text-[#e2e8e4] transition-colors hover:border-white/50 hover:bg-[#161e2e]"
            >
              LAUNCH CONSOLE [C2]
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. Solid Dark Matte 3D Sphere Canvas (No Rim Glow / No Corona) ── */}
      <HeroCanvas />

      {/* ── 3. Subtle Cyber Background Radial Ambient Lighting ── */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_40%,_#070a0f_95%)] z-0" />
      <div className="absolute -bottom-36 right-1/4 w-[45rem] h-[45rem] rounded-full bg-[#101622]/40 blur-[160px] pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] rounded-full bg-[#162032]/25 blur-[140px] pointer-events-none z-0" />

      {/* ── 4. Foreground Monolith Typography & Bottom Elements ── */}
      <div
        ref={heroContentRef}
        className="relative z-20 w-full h-full flex flex-col justify-between items-center pt-28 pb-16 px-4 pointer-events-none"
      >
        {/* Massive, Widely Letter-Spaced, Ultra-Bold (font-black) MARIS Typography */}
        <div className="flex-1 flex items-center justify-center w-full">
          <h1
            ref={titleRef}
            className="text-6xl sm:text-8xl md:text-9xl lg:text-[14rem] font-black tracking-[0.35em] sm:tracking-[0.45em] text-[#e2e8e4] uppercase text-center pl-[0.35em] sm:pl-[0.45em] select-none opacity-95 transition-transform drop-shadow-[0_15px_40px_rgba(0,0,0,0.9)]"
            style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            MARIS
          </h1>
        </div>

        {/* Bottom Hero Elements */}
        <div
          ref={ctaBlockRef}
          className="flex flex-col items-center text-center gap-3 pointer-events-auto max-w-md w-full"
        >
          {/* Subtitle */}
          <p className="font-mono-inst text-xs sm:text-sm font-bold tracking-[0.3em] text-[#e2e8e4] uppercase">
            THAT SIMPLY WORKS
          </p>

          {/* Microcopy with Green Status Dot */}
          <div className="flex items-center gap-2 font-mono-inst text-[11px] text-[#8c978f] tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5b937c]" />
            <span>Enterprise Grade Security</span>
          </div>

          {/* ── 3D Animated Scroll Down Indicator ── */}
          <button
            type="button"
            onClick={() => {
              window.scrollTo({
                top: window.innerHeight * 1.1,
                behavior: 'smooth',
              });
            }}
            className="group mt-3 flex flex-col items-center gap-2 cursor-pointer transition-transform hover:translate-y-0.5"
            aria-label="Scroll down to explore"
          >
            {/* 3D Cyber Mouse / Track Capsule */}
            <div className="relative h-9 w-5 rounded-full border border-white/20 bg-[#0b1018]/80 p-1 shadow-[0_0_12px_rgba(59,123,153,0.25)] backdrop-blur-sm group-hover:border-white/40">
              {/* Traveling Glowing Light Pip */}
              <div className="h-2 w-2 rounded-full bg-[#3b7b99] shadow-[0_0_8px_#3b7b99] animate-[bounce_1.8s_infinite] mx-auto" />
            </div>

            {/* Pulsing Text & Downward Indicator */}
            <div className="flex items-center gap-1 font-mono-inst text-[9px] uppercase tracking-[0.25em] text-[#8c978f] group-hover:text-[#e2e8e4] transition-colors">
              <span>SCROLL DOWN</span>
              <span className="animate-pulse">↓</span>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
