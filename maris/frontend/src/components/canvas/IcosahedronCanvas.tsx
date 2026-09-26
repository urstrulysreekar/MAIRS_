'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PresentationControls, Float } from '@react-three/drei';
import * as THREE from 'three';

function RotatingIcosahedron() {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.15;
      meshRef.current.rotation.y += delta * 0.22;
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.x += delta * 0.15;
      wireframeRef.current.rotation.y += delta * 0.22;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.8}>
      <group>
        {/* Dark Metallic Solid Core */}
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[2.0, 0]} />
          <meshStandardMaterial
            color="#090d18"
            metalness={0.95}
            roughness={0.12}
            flatShading
          />
        </mesh>

        {/* Outer Dark Metallic Wireframe Structure */}
        <mesh ref={wireframeRef}>
          <icosahedronGeometry args={[2.02, 0]} />
          <meshBasicMaterial
            color="#a5b4fc"
            wireframe
            transparent
            opacity={0.45}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function IcosahedronCanvas() {
  return (
    <div className="absolute inset-0 pointer-events-auto z-20">
      <Canvas
        camera={{ position: [0, 0, 6.0], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 15, 10]} intensity={2.0} color="#ffffff" />
        <pointLight position={[-10, -10, -5]} intensity={2.5} color="#3b82f6" />
        <pointLight position={[6, -2, 4]} intensity={3.0} color="#f472b6" />

        <PresentationControls
          global
          snap
          speed={1.5}
          zoom={1}
          rotation={[0, 0, 0]}
          polar={[-Math.PI / 4, Math.PI / 4]}
          azimuth={[-Math.PI / 4, Math.PI / 4]}
        >
          <RotatingIcosahedron />
        </PresentationControls>
      </Canvas>
    </div>
  );
}
