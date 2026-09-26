'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import ParticleWave from './ParticleWave';
import InteractiveOrb from './InteractiveOrb';

export default function Scene3D() {
  return (
    <div className="absolute inset-0 pointer-events-auto h-full w-full overflow-hidden">
      <Canvas
        camera={{ position: [0, 1.2, 6.5], fov: 52 }}
        dpr={[1, 2]} // Crisp rendering on high-DPI displays without GPU throttling
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} color="#bae6fd" />
          <pointLight position={[-10, -5, -5]} intensity={1.5} color="#06b6d4" />
          <pointLight position={[3, 2, 2]} intensity={2.0} color="#38bdf8" />

          {/* Undulating Acoustic Sea */}
          <ParticleWave gridSize={60} separation={0.6} color="#06b6d4" />

          {/* Morphing Sonar Anomaly Target */}
          <InteractiveOrb position={[3.2, 0.4, -1.8]} scale={1.35} />
        </Suspense>
      </Canvas>
    </div>
  );
}
