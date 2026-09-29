'use client';

import React, { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Hero from '@/components/hero/Hero';
import HeroEclipse from '@/components/HeroEclipse';
import ArtReveal from '@/components/landing/ArtReveal';
import WhyMaris from '@/components/landing/WhyMaris';
import PipelineSequence from '@/components/landing/PipelineSequence';
import ProductPreview from '@/components/landing/ProductPreview';
import StatsBand from '@/components/landing/StatsBand';
import HazardTaxonomy from '@/components/landing/HazardTaxonomy';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  useEffect(() => {
    // Initialize buttery smooth inertial scrolling with Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(updateLenis);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#030305] text-[#e2e8e4] selection:bg-[#3b7b99] selection:text-white overflow-hidden">
      {/* ── 1. Hero Section matching reference aesthetic ── */}
      <Hero />

      {/* ── 2. Real-Time Hydrographic Intelligence & Sensor Telemetry Bench ── */}
      <HeroEclipse />

      {/* ── 3. Pinned 3D Acoustic Descent Sequence (GSAP ScrollTrigger) ── */}
      <ArtReveal />

      {/* ── 4. Technical Specification Ledger (Edge Processing Autonomy) ── */}
      <WhyMaris />

      {/* ── 5. 5-Stage Edge Acoustic Pipeline Sequence ── */}
      <PipelineSequence />

      {/* ── 6. Live Operations Acoustic Signal Inspector & Anomaly Triage Preview ── */}
      <ProductPreview />

      {/* ── 7. Hydrographic Metrics Grid ── */}
      <StatsBand />

      {/* ── 8. Architectural Hazard Taxonomy (HZ-NET, HZ-WRECK, HZ-UXO, HZ-PIPE, HZ-BIO, HZ-GEO) ── */}
      <HazardTaxonomy />

      {/* ── 9. Call to Action (C2 Console Access) ── */}
      <FinalCTA />

      {/* ── 10. Institutional Brand Footer ── */}
      <Footer />
    </main>
  );
}
