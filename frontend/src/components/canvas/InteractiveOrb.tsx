'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float } from '@react-three/drei';
import * as THREE from 'three';

interface InteractiveOrbProps {
  position?: [number, number, number];
  scale?: number;
}

export default function InteractiveOrb({
  position = [3.2, 0.5, -2],
  scale = 1.4,
}: InteractiveOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  // Target values for smooth lerping
  const targetColor = useRef(new THREE.Color('#06b6d4'));
  const currentColor = useRef(new THREE.Color('#06b6d4'));
  const targetDistort = useRef(0.38);
  const targetSpeed = useRef(1.8);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Slow organic axial rotation
    meshRef.current.rotation.x += delta * 0.15;
    meshRef.current.rotation.y += delta * 0.22;

    // Set targets based on hover state
    if (hovered) {
      targetColor.current.set('#f43f5e'); // Warning Red / Hot Anomaly
      targetDistort.current = 0.72;
      targetSpeed.current = 4.8;
    } else {
      targetColor.current.set('#06b6d4'); // Calm Marine Cyan
      targetDistort.current = 0.38;
      targetSpeed.current = 1.8;
    }

    // Smooth interpolations (lerp)
    currentColor.current.lerp(targetColor.current, delta * 3.5);

    if (materialRef.current) {
      materialRef.current.color = currentColor.current;
      materialRef.current.distort = THREE.MathUtils.lerp(
        materialRef.current.distort,
        targetDistort.current,
        delta * 3.5
      );
      materialRef.current.speed = THREE.MathUtils.lerp(
        materialRef.current.speed,
        targetSpeed.current,
        delta * 3.5
      );
    }
  });

  return (
    <Float speed={2.2} rotationIntensity={0.8} floatIntensity={1.2}>
      <group position={position} scale={scale}>
        {/* Central Morphing Fluid Mesh */}
        <Sphere
          ref={meshRef}
          args={[1, 64, 64]}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = 'auto';
          }}
        >
          <MeshDistortMaterial
            ref={materialRef}
            color="#06b6d4"
            roughness={0.15}
            metalness={0.7}
            distort={0.38}
            speed={1.8}
            wireframe={false}
          />
        </Sphere>

        {/* Outer Bathymetric Wireframe Halo */}
        <Sphere args={[1.22, 18, 18]}>
          <meshBasicMaterial
            color={hovered ? '#fb7185' : '#38bdf8'}
            wireframe
            transparent
            opacity={hovered ? 0.25 : 0.12}
          />
        </Sphere>
      </group>
    </Float>
  );
}
