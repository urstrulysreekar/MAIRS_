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

// ── Interactive 3D WebGL Planet with High-Detail Textures & Cinematic Lighting ──
function TexturedEclipsePlanet() {
  const groupRef = useRef<THREE.Group>(null);
  const planetMeshRef = useRef<THREE.Mesh>(null);
  const planetMatRef = useRef<THREE.MeshStandardMaterial>(null);

  const currentOpacity = useRef(1);
  const currentY = useRef(0);

  // Load high-resolution textures via Drei hook
  const textures = useTexture(TEXTURE_URLS);

  useFrame((state, delta) => {
    if (!groupRef.current || !planetMatRef.current) return;

    // Read window scroll directly without native scroll event listeners
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;

    // ── Reversed Scroll Opacity Interpolation ──
    // Fully visible (1) at the absolute top (scrollY === 0).
    // Smoothly decreases to 0 as user scrolls down, fading back in at the top.
    const fadeDistance = 450;
    const targetOpacity = THREE.MathUtils.clamp(1 - scrollY / fadeDistance, 0, 1);
    currentOpacity.current = THREE.MathUtils.lerp(
      currentOpacity.current,
      targetOpacity,
      Math.min(delta * 4.5, 1)
    );

    // Apply interpolated opacity to planet material
    planetMatRef.current.opacity = currentOpacity.current;
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
      {/* ── Main Planet Body with High-Detail Normal & Roughness Maps ── */}
      <mesh ref={planetMeshRef}>
        <sphereGeometry args={[2.4, 64, 64]} />
        <meshStandardMaterial
          ref={planetMatRef}
          map={textures.map}
          normalMap={textures.normalMap}
          roughnessMap={textures.roughnessMap}
          normalScale={new THREE.Vector2(3.5, 3.5)}
          color="#020208" // Deep near-black midnight blue base
          roughness={0.8}  // High roughness to organically absorb light
          metalness={0.1}  // Low metalness to prevent washed-out sheen
          transparent={true}
          opacity={1}
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
          {/* Subtle ambient light keeping front hemisphere deeply dark */}
          <ambientLight intensity={0.01} />

          {/* High-contrast DirectionalLight positioned far side-back creating a sharp terminator line */}
          <directionalLight position={[10, 0, -10]} intensity={14} color="#ffffff" />

          {/* Electric cyan/blue PointLight grazing dark edge to catch surface relief */}
          <pointLight
            position={[2.5, 1.0, -0.6]}
            intensity={9.5}
            color="#00f0ff"
            distance={14}
            decay={2}
          />

          {/* Planet */}
          <TexturedEclipsePlanet />
        </Suspense>
      </Canvas>
    </div>
  );
}
