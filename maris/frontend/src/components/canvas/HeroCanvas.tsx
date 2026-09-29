'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── Interactive 3D WebGL Planet with 'Eclipse' Lighting & Reversed Scroll Fade ──
function EclipsePlanet() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const currentOpacity = useRef(1);
  const currentY = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;

    // Read window scroll directly without native scroll event listeners
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;

    // ── Reversed Scroll Opacity Interpolation ──
    // Fully visible (opacity: 1) at the absolute top of the page (scrollY === 0).
    // As the user scrolls down, smoothly decreases opacity to 0, causing the planet to vanish.
    // When scrolling back up to the top, smoothly interpolates back in to full visibility (1).
    const fadeDistance = 450;
    const targetOpacity = THREE.MathUtils.clamp(1 - scrollY / fadeDistance, 0, 1);
    currentOpacity.current = THREE.MathUtils.lerp(
      currentOpacity.current,
      targetOpacity,
      Math.min(delta * 4.5, 1)
    );
    materialRef.current.opacity = currentOpacity.current;
    meshRef.current.visible = currentOpacity.current > 0.001;

    // ── Scroll Parallax (Shifts slightly upward as user scrolls down) ──
    const targetY = scrollY * 0.0008;
    currentY.current = THREE.MathUtils.lerp(
      currentY.current,
      targetY,
      Math.min(delta * 4.0, 1)
    );
    meshRef.current.position.y = currentY.current;

    // ── Slow Planetary Axial Rotation ──
    meshRef.current.rotation.y += delta * 0.045;
    meshRef.current.rotation.x = 0.16; // Subtle axial tilt
    meshRef.current.rotation.z = -0.08;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      {/* Optimized SphereGeometry capped at 64x64 segments */}
      <sphereGeometry args={[2.4, 64, 64]} />
      {/* Matte, light-absorbing celestial body with near-black color */}
      <meshStandardMaterial
        ref={materialRef}
        color="#020205"
        roughness={0.9}
        metalness={0.1}
        transparent={true}
        opacity={1}
      />
    </mesh>
  );
}

export default function HeroCanvas() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
      }}
      className="fixed inset-0 pointer-events-none -z-10"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        {/* Minimal ambient light so front hemisphere stays near-black */}
        <ambientLight intensity={0.02} />

        {/* Strong DirectionalLight positioned behind and slightly to the side to create the glowing crescent */}
        <directionalLight position={[5, 2, -5]} intensity={8.0} color="#ffffff" />

        {/* Subtle, colored PointLights (icy blue & cyan) to catch the rim and mimic glowing eclipse edge */}
        <pointLight
          position={[2.6, 1.6, -0.6]}
          intensity={6.5}
          color="#38bdf8"
          distance={14}
          decay={2}
        />
        <pointLight
          position={[1.5, 2.4, -0.8]}
          intensity={4.5}
          color="#00f0ff"
          distance={10}
          decay={2}
        />

        {/* 3D Planet */}
        <EclipsePlanet />
      </Canvas>
    </div>
  );
}
