'use client';

import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// High-fidelity planetary texture maps from verified CDN
const TEXTURE_URLS = {
  map: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/moon_1024.jpg',
  normalMap: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_normal_2048.jpg',
  roughnessMap: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_specular_2048.jpg',
};

// ── Interactive 3D WebGL Planet with High-Detail Textures & Atmospheric Halo ──
function TexturedEclipsePlanet() {
  const groupRef = useRef<THREE.Group>(null);
  const planetMeshRef = useRef<THREE.Mesh>(null);
  const planetMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const atmosphereMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const currentOpacity = useRef(1);
  const currentY = useRef(0);

  // Load high-resolution textures via Drei hook
  const textures = useTexture(TEXTURE_URLS);

  useFrame((state, delta) => {
    if (!groupRef.current || !planetMatRef.current || !atmosphereMatRef.current) return;

    // Read window scroll directly without native scroll event listeners
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;

    // ── Reversed Scroll Opacity Interpolation ──
    // Fully visible (1) at the absolute top (scrollY === 0).
    // As user scrolls down, opacity smoothly decreases to 0, causing planet and atmosphere to vanish.
    // When scrolling back up to the top, smoothly fades back to full visibility.
    const fadeDistance = 450;
    const targetOpacity = THREE.MathUtils.clamp(1 - scrollY / fadeDistance, 0, 1);
    currentOpacity.current = THREE.MathUtils.lerp(
      currentOpacity.current,
      targetOpacity,
      Math.min(delta * 4.5, 1)
    );

    // Apply interpolated opacity to planet and atmospheric halo
    planetMatRef.current.opacity = currentOpacity.current;
    atmosphereMatRef.current.opacity = currentOpacity.current * 0.15; // Low atmospheric opacity
    groupRef.current.visible = currentOpacity.current > 0.001;

    // ── Scroll Parallax (Shifts slightly upward as user scrolls down) ──
    const targetY = scrollY * 0.0008;
    currentY.current = THREE.MathUtils.lerp(
      currentY.current,
      targetY,
      Math.min(delta * 4.0, 1)
    );
    groupRef.current.position.y = currentY.current;

    // ── Slow Planetary Axial Rotation ──
    if (planetMeshRef.current) {
      planetMeshRef.current.rotation.y += delta * 0.038;
      planetMeshRef.current.rotation.x = 0.16; // Subtle axial tilt
      planetMeshRef.current.rotation.z = -0.08;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* ── 1. Main Planet Body with High-Detail Normal & Roughness Maps ── */}
      <mesh ref={planetMeshRef}>
        <sphereGeometry args={[2.4, 64, 64]} />
        <meshStandardMaterial
          ref={planetMatRef}
          map={textures.map}
          normalMap={textures.normalMap}
          roughnessMap={textures.roughnessMap}
          normalScale={new THREE.Vector2(3.5, 3.5)} // High normal scale to highlight ridges under grazing light
          color="#0a1220" // Dark moody tint preserving the deep-space aesthetic
          roughness={0.88}
          metalness={0.12}
          transparent={true}
          opacity={1}
        />
      </mesh>

      {/* ── 2. Atmospheric Glow Optical Halo (Scaled 1.035, BackSide + Additive) ── */}
      <mesh scale={1.035}>
        <sphereGeometry args={[2.4, 64, 64]} />
        <meshBasicMaterial
          ref={atmosphereMatRef}
          color="#00f0ff"
          transparent={true}
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
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
        <Suspense fallback={null}>
          {/* Minimal ambient light keeping front hemisphere dark */}
          <ambientLight intensity={0.02} />

          {/* Dramatic DirectionalLight creating a harsh terminator line across normal maps */}
          <directionalLight position={[5, 2.2, -4.5]} intensity={8.5} color="#ffffff" />

          {/* Icy blue & cyan PointLights catching the rim and highlighting surface ridges */}
          <pointLight
            position={[2.7, 1.8, -0.5]}
            intensity={7.0}
            color="#38bdf8"
            distance={15}
            decay={2}
          />
          <pointLight
            position={[1.5, 2.5, -0.7]}
            intensity={5.0}
            color="#00f0ff"
            distance={11}
            decay={2}
          />

          {/* Planet with atmosphere */}
          <TexturedEclipsePlanet />
        </Suspense>
      </Canvas>
    </div>
  );
}
