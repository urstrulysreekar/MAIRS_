'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleWaveProps {
  gridSize?: number;
  separation?: number;
  color?: string;
}

export default function ParticleWave({
  gridSize = 65,
  separation = 0.55,
  color = '#06b6d4',
}: ParticleWaveProps) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate initial particle grid geometry
  const { positions, originalY, count } = useMemo(() => {
    const totalPoints = gridSize * gridSize;
    const pos = new Float32Array(totalPoints * 3);
    const origY = new Float32Array(totalPoints);

    const halfGrid = (gridSize * separation) / 2;

    let index = 0;
    for (let ix = 0; ix < gridSize; ix++) {
      for (let iz = 0; iz < gridSize; iz++) {
        const x = ix * separation - halfGrid;
        const z = iz * separation - halfGrid;
        const y = 0;

        pos[index * 3] = x;
        pos[index * 3 + 1] = y;
        pos[index * 3 + 2] = z;

        origY[index] = y;
        index++;
      }
    }

    return {
      positions: pos,
      originalY: origY,
      count: totalPoints,
    };
  }, [gridSize, separation]);

  // Undulating acoustic wave motion simulation
  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position;
    const t = clock.getElapsedTime() * 0.9;

    for (let i = 0; i < count; i++) {
      const x = positions[i * 3];
      const z = positions[i * 3 + 2];

      // Multi-harmonic acoustic bathymetry wave function
      const wave1 = Math.sin(x * 0.25 + t * 1.4) * 0.75;
      const wave2 = Math.cos(z * 0.28 + t * 1.1) * 0.75;
      const wave3 = Math.sin((x + z) * 0.18 + t * 0.7) * 0.5;

      posAttr.setY(i, wave1 + wave2 + wave3 - 3.2);
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} position={[0, -1.5, -5]} rotation={[-Math.PI / 6, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        color={color}
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
