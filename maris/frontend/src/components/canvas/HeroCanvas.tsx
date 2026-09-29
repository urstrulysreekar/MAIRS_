'use client';

import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// ── High-Resolution Grayscale Lunar & Volcanic Rock Texture Maps ──
const TEXTURE_URLS = {
  // Grayscale lunar surface map for realistic craters and ridges
  map: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/moon_1024.jpg',
  // Extreme elevation terrain normal map
  normalMap: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_normal_2048.jpg',
  // Tactile surface roughness map
  roughnessMap: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/moon_1024.jpg',
};

// ── Ultra-Premium Obsidian Lunar Planet (Physical Material & Stark Eclipse Lighting) ──
function ObsidianEclipsePlanet() {
  const groupRef = useRef<THREE.Group>(null);
  const planetMeshRef = useRef<THREE.Mesh>(null);
  const planetMatRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const currentOpacity = useRef(1);
  const currentY = useRef(0);

  // Load high-resolution grayscale textures
  const textures = useTexture(TEXTURE_URLS);

  useFrame((state, delta) => {
    if (!groupRef.current || !planetMatRef.current) return;

    // Read window scroll directly without native scroll event listeners
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;

    // ── Reverse Scroll-Opacity Interpolation ──
    // Fully visible (1) at top of page; smoothly fades to 0 as user scrolls down
    const fadeDistance = 450;
    const targetOpacity = THREE.MathUtils.clamp(1 - scrollY / fadeDistance, 0, 1);
    currentOpacity.current = THREE.MathUtils.lerp(
      currentOpacity.current,
      targetOpacity,
      Math.min(delta * 4.5, 1)
    );

    // Apply interpolated opacity to physical material
    planetMatRef.current.opacity = currentOpacity.current;
    groupRef.current.visible = currentOpacity.current > 0.001;

    // ── Scroll Parallax (Y-Axis shift) ──
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
      planetMeshRef.current.rotation.x = 0.16; // Subtle natural axial tilt
      planetMeshRef.current.rotation.z = -0.06;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Solid, sharp planet body grounded physically in space without external halos */}
      <mesh ref={planetMeshRef}>
        <sphereGeometry args={[2.4, 64, 64]} />
        <meshPhysicalMaterial
          ref={planetMatRef}
          map={textures.map}
          normalMap={textures.normalMap}
          roughnessMap={textures.roughnessMap}
          normalScale={new THREE.Vector2(3.5, 3.5)} // Raking ridges & deep crater relief
          color="#0a0a0f" // Deep, rich obsidian slate base
          roughness={0.85} // Absorptive volcanic rock texture
          metalness={0.08} // Non-metallic mineral ground
          clearcoat={0.1} // Subtle premium sheen
          clearcoatRoughness={0.25}
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
          {/* Barely visible ambient light so dark hemisphere isn't pitch black */}
          <ambientLight intensity={0.05} color="#ffffff" />

          {/* High-intensity pure white DirectionalLight at extreme back-angle creating stark eclipse crescent */}
          <directionalLight
            position={[12, 2, -10]}
            intensity={18}
            color="#ffffff"
          />

          {/* Physically grounded Obsidian planet body */}
          <ObsidianEclipsePlanet />
        </Suspense>
      </Canvas>
    </div>
  );
}
