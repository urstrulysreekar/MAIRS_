'use client';

import React, { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
  // Initialize Lenis smooth scroll
  useEffect(() => {
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
    <main className="min-h-screen bg-[#03030f] text-white selection:bg-[#00f0ff] selection:text-black">
      {/* ── 1. The Flagship Pixel-Faithful Eclipse Hero ── */}
      <HeroEclipse />

      {/* ── 2. Pinned Art Reveal Section (300vh GSAP ScrollTrigger Sequence) ── */}
      <ArtReveal />

      {/* ── 3. Why MARIS (3 Large Glass Cards) ── */}
      <WhyMaris />

      {/* ── 4. 5-Stage Real-Time Pipeline Sequence ── */}
      <PipelineSequence />

      {/* ── 5. Live Operations Console 3D Browser Preview ── */}
      <ProductPreview />

      {/* ── 6. Live Telemetry Stats Band ── */}
      <StatsBand />

      {/* ── 7. Multi-Spectral Hazard Taxonomy ── */}
      <HazardTaxonomy />

      {/* ── 8. Final Call to Action with Bottom Eclipse Ring ── */}
      <FinalCTA />

      {/* ── 9. Minimalist Brand Footer ── */}
      <Footer />
    </main>
  );
}
