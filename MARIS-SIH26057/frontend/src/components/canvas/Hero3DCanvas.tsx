'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// ── 1. Morphing Sonar Target Core ──
function SonarAnomalyCore({ position = [2.8, 0.2, 0] }: { position?: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  const targetColor = useRef(new THREE.Color('#3b7b99'));
  const currentColor = useRef(new THREE.Color('#3b7b99'));

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    meshRef.current.rotation.x += delta * 0.2;
    meshRef.current.rotation.y += delta * 0.35;

    if (hovered) {
      targetColor.current.set('#d93829'); // Signal Vermilion on hover
    } else {
      targetColor.current.set('#3b7b99'); // Signal Marine
    }

    currentColor.current.lerp(targetColor.current, delta * 4);

    if (materialRef.current) {
      materialRef.current.color = currentColor.current;
      materialRef.current.distort = THREE.MathUtils.lerp(
        materialRef.current.distort,
        hovered ? 0.65 : 0.32,
        delta * 3
      );
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.8} floatIntensity={1.2}>
      <group position={position}>
        {/* Core Organic Acoustic Distortion Sphere */}
        <Sphere
          ref={meshRef}
          args={[1.15, 64, 64]}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          <MeshDistortMaterial
            ref={materialRef}
            color="#3b7b99"
            roughness={0.2}
            metalness={0.7}
            distort={0.32}
            speed={1.6}
          />
        </Sphere>

        {/* Outer Bathymetric Wireframe Halo */}
        <Sphere args={[1.45, 20, 20]}>
          <meshBasicMaterial
            color={hovered ? '#d93829' : '#5b937c'}
            wireframe
            transparent
            opacity={hovered ? 0.35 : 0.15}
          />
        </Sphere>
      </group>
    </Float>
  );
}

// ── 2. Multi-Harmonic Bathymetric Acoustic Particle Sea ──
function BathymetricWaveGrid({ count = 4500 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const gridSize = 65;
  const separation = 0.55;

  const { positions, totalCount } = useMemo(() => {
    const total = gridSize * gridSize;
    const pos = new Float32Array(total * 3);
    const half = (gridSize * separation) / 2;

    let idx = 0;
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        pos[idx * 3] = x * separation - half;
        pos[idx * 3 + 1] = -2.5;
        pos[idx * 3 + 2] = z * separation - half - 2;
        idx++;
      }
    }
    return { positions: pos, totalCount: total };
  }, [gridSize, separation]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const t = clock.getElapsedTime() * 0.8;

    for (let i = 0; i < totalCount; i++) {
      const x = positions[i * 3];
      const z = positions[i * 3 + 2];
      const y =
        Math.sin(x * 0.22 + t * 1.3) * 0.65 +
        Math.cos(z * 0.25 + t * 1.0) * 0.65 +
        Math.sin((x + z) * 0.15 + t * 0.6) * 0.4 -
        2.5;
      posAttr.setY(i, y);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} rotation={[-Math.PI / 8, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        color="#3b7b99"
        transparent
        opacity={0.45}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ── 3. Sonar Ping Wave Ring ──
function SonarPingRings() {
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t1 = (clock.getElapsedTime() * 0.7) % 3.0;
    const t2 = ((clock.getElapsedTime() * 0.7) + 1.5) % 3.0;

    if (ring1.current) {
      ring1.current.scale.set(1 + t1 * 3.5, 1 + t1 * 3.5, 1);
      (ring1.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, (1 - t1 / 3.0) * 0.4);
    }
    if (ring2.current) {
      ring2.current.scale.set(1 + t2 * 3.5, 1 + t2 * 3.5, 1);
      (ring2.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, (1 - t2 / 3.0) * 0.4);
    }
  });

  return (
    <group position={[2.8, -1.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={ring1}>
        <ringGeometry args={[0.8, 0.85, 48]} />
        <meshBasicMaterial color="#5b937c" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring2}>
        <ringGeometry args={[0.8, 0.85, 48]} />
        <meshBasicMaterial color="#3b7b99" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ── 4. Interactive Camera Rig with Smooth Mouse Parallax ──
function CameraRig() {
  useFrame(({ camera, pointer }) => {
    // Parallax sway
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.8, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.5 + pointer.y * 0.5, 0.05);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ── 5. Master 3D Hero Canvas Component ──
export default function Hero3DCanvas({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-auto overflow-hidden ${className}`}>
      <Canvas
        camera={{ position: [0, 0.5, 6.2], fov: 48 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <CameraRig />

        {/* Ambient Oceanic Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[8, 12, 6]} intensity={1.2} color="#e2e8e4" />
        <pointLight position={[-6, -3, -2]} intensity={1.5} color="#3b7b99" />
        <pointLight position={[4, 2, 2]} intensity={1.8} color="#5b937c" />

        {/* Dynamic Scene Objects */}
        <SonarAnomalyCore position={[2.4, 0.2, -0.5]} />
        <BathymetricWaveGrid />
        <SonarPingRings />
      </Canvas>
    </div>
  );
}
