'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { scrollProgress } from '@/lib/scrollBridge';

// ── Solid Dark Matte 3D Celestial Body (No glowing ring, no corona, no fresnel rim) ──
function MatteDarkSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetScale = useRef(1);
  const currentScale = useRef(1);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Gentle planetary rotation
    meshRef.current.rotation.y += delta * 0.08;
    meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.04;

    // Scroll-driven scale: smoothly scales up as user scrolls through the pinned hero section
    const progress = scrollProgress.value;
    targetScale.current = 1 + progress * 4.2;
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale.current, delta * 6);
    
    meshRef.current.scale.setScalar(currentScale.current);

    // Subtle response to cursor
    meshRef.current.rotation.z = THREE.MathUtils.lerp(
      meshRef.current.rotation.z,
      state.pointer.x * 0.05,
      delta * 2
    );
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      {/* High subdivision sphere */}
      <sphereGeometry args={[1.75, 128, 128]} />
      {/* Matte dark celestial body blending into #070a0f background */}
      <meshStandardMaterial
        color="#090e18"
        roughness={0.88}
        metalness={0.12}
        envMapIntensity={0.1}
      />
    </mesh>
  );
}

export default function HeroCanvas() {
  return null;
}
