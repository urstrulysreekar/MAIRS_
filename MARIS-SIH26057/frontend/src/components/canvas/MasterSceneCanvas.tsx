'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { scrollProgress } from '@/lib/scrollBridge';
import { useDemoStore } from '@/lib/demo';

// ── 1. Scene 1 & 4 Celestial Solid Sphere & Eclipse ──
function CelestialSphere({ progress }: { progress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const backlightRef = useRef<THREE.PointLight>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Continuous slow rotation
    meshRef.current.rotation.y += delta * 0.08;
    meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.15) * 0.04;

    // Scale and position based on scroll progress (0.0 to 1.0)
    // In Scene 1 (0 to 0.25): Centered solid dark sphere, scales up on scroll
    // In Scene 2 & 3 (0.25 to 0.55): Shifts to right/center
    // In Scene 4 (0.55 to 0.72): Eclipse mode with backlight moving behind
    // In Scene 5 & 6 (0.72 to 1.0): Fades for dotted globe
    const p = scrollProgress.globalValue;

    if (p < 0.25) {
      // Scene 1: Centered solid dark matte sphere, NO rim light, NO corona
      const s1Progress = p / 0.25;
      meshRef.current.scale.setScalar(1.65 + s1Progress * 0.8);
      meshRef.current.position.set(0, 0, 0);
      meshRef.current.visible = true;
      if (coronaRef.current) coronaRef.current.visible = false;
      if (backlightRef.current) backlightRef.current.intensity = 0;
    } else if (p < 0.55) {
      // Scene 2 & 3: Translucent glass morphing state
      const s2Progress = (p - 0.25) / 0.3;
      meshRef.current.scale.setScalar(1.4 - s2Progress * 0.3);
      meshRef.current.position.set(1.6 * (1 - s2Progress * 0.5), -0.2, 0);
      meshRef.current.visible = true;
      if (coronaRef.current) coronaRef.current.visible = false;
      if (backlightRef.current) backlightRef.current.intensity = 0;
    } else if (p < 0.75) {
      // Scene 4: Eclipse mode - Light moves behind creating glowing crescent
      const s4Progress = (p - 0.55) / 0.2;
      meshRef.current.scale.setScalar(1.5);
      meshRef.current.position.set(0, 0, 0);
      meshRef.current.visible = true;
      
      if (coronaRef.current) {
        coronaRef.current.visible = true;
        coronaRef.current.scale.setScalar(1.58 + Math.sin(s4Progress * Math.PI) * 0.12);
      }
      if (backlightRef.current) {
        // Backlight sweeps behind from right to left
        backlightRef.current.position.set(Math.cos(s4Progress * Math.PI) * 2.2, Math.sin(s4Progress * Math.PI) * 0.8, -1.8);
        backlightRef.current.intensity = 8.0 * Math.sin(s4Progress * Math.PI);
      }
    } else {
      // Faded out in Scene 5 & 6 in favor of Dotted Globe
      meshRef.current.visible = false;
      if (coronaRef.current) coronaRef.current.visible = false;
      if (backlightRef.current) backlightRef.current.intensity = 0;
    }
  });

  return (
    <group>
      {/* Moving Eclipse Backlight */}
      <pointLight ref={backlightRef} color="#7B3DFF" intensity={0} distance={10} />

      {/* Solid Dark Matte Sphere */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1.0, 96, 96]} />
        <meshStandardMaterial
          color="#060714"
          roughness={0.92}
          metalness={0.08}
          envMapIntensity={0.05}
        />
      </mesh>

      {/* Thin Eclipse Corona Ring (Active only in Scene 4 Eclipse) */}
      <mesh ref={coronaRef} position={[0, 0, -0.02]} visible={false}>
        <ringGeometry args={[0.99, 1.05, 64]} />
        <meshBasicMaterial
          color="#C7B6FF"
          transparent
          opacity={0.65}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// ── 2. Scene 3 Translucent Glass Sphere with Violet Interior & Comet Streak ──
function GlassEvidenceSphere() {
  const groupRef = useRef<THREE.Group>(null);
  const streakRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const p = scrollProgress.globalValue;

    // Visible predominantly in Scene 3 (0.35 to 0.55)
    if (p >= 0.32 && p <= 0.58) {
      const visibility = Math.sin(((p - 0.32) / 0.26) * Math.PI);
      groupRef.current.visible = true;
      groupRef.current.scale.setScalar(1.35 * visibility);
      groupRef.current.position.set(0, 0.1, 0);

      // Comet docket streak animation
      if (streakRef.current) {
        streakRef.current.rotation.z += delta * 1.5;
      }
    } else {
      groupRef.current.visible = false;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} visible={false}>
      {/* Translucent Glass Outer Sphere */}
      <mesh>
        <sphereGeometry args={[1.1, 64, 64]} />
        <meshPhysicalMaterial
          color="#0A0A2C"
          transmission={0.88}
          opacity={1}
          transparent
          roughness={0.15}
          ior={1.45}
          thickness={1.8}
          specularColor="#C7B6FF"
        />
      </mesh>

      {/* Soft Violet Glowing Core */}
      <mesh>
        <sphereGeometry args={[0.65, 32, 32]} />
        <meshBasicMaterial
          color="#7B3DFF"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Bright Comet Streak (Signed Docket Orbit) */}
      <mesh ref={streakRef} rotation={[0.4, 0.2, 0]}>
        <torusGeometry args={[1.22, 0.018, 16, 64, Math.PI * 0.9]} />
        <meshBasicMaterial
          color="#EDEBFF"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// ── 3. Scene 5 & 6 Dotted Fibonacci Globe with Real Detection Pins ──
function DottedGlobeScene() {
  const groupRef = useRef<THREE.Group>(null);
  const { anomalies } = useDemoStore();

  // Generate Fibonacci Sphere Dots (land/grid simulation)
  const { positions, totalPoints } = useMemo(() => {
    const numPoints = 2800;
    const pos = new Float32Array(numPoints * 3);
    const radius = 1.35;
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      pos[i * 3] = Math.cos(theta) * radiusAtY * radius;
      pos[i * 3 + 1] = y * radius;
      pos[i * 3 + 2] = Math.sin(theta) * radiusAtY * radius;
    }

    return { positions: pos, totalPoints: numPoints };
  }, []);

  // Convert real anomaly lat/lng to 3D Sphere coordinates
  const pinPositions = useMemo(() => {
    const radius = 1.37;
    return anomalies
      .filter((anom) => anom.latitude != null && anom.longitude != null)
      .slice(0, 16)
      .map((anom) => {
      const phi = (90 - anom.latitude!) * (Math.PI / 180);
      const theta = (anom.longitude! + 180) * (Math.PI / 180);

      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);

      return { x, y, z, label: anom.label, id: anom.id, hazardClass: anom.hazardClass };
      });
  }, [anomalies]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const p = scrollProgress.globalValue;

    // Visible in Scene 5 & 6 (0.70 to 1.0)
    if (p >= 0.68) {
      const visibility = Math.min(1, (p - 0.68) / 0.1);
      groupRef.current.visible = true;
      groupRef.current.scale.setScalar(1.25 * visibility);

      // Slow smooth rotation
      groupRef.current.rotation.y += delta * 0.12;
      groupRef.current.rotation.x = 0.22 + Math.sin(state.clock.getElapsedTime() * 0.2) * 0.05;
    } else {
      groupRef.current.visible = false;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} visible={false}>
      {/* Dotted Globe Points */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.024}
          color="#7B3DFF"
          transparent
          opacity={0.85}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Bright Rim Atmosphere Glow */}
      <mesh>
        <sphereGeometry args={[1.36, 48, 48]} />
        <meshBasicMaterial
          color="#2F2BFF"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* Real Detection Pins */}
      {pinPositions.map((pin) => (
        <group key={pin.id} position={[pin.x, pin.y, pin.z]}>
          <mesh>
            <sphereGeometry args={[0.032, 16, 16]} />
            <meshBasicMaterial color="#EDEBFF" />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.1, 8]} />
            <meshBasicMaterial color="#C7B6FF" transparent opacity={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── Master Scene 3D Coordinator Canvas ──
export default function MasterSceneCanvas() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 h-screen w-screen bg-[#040313]">
      <Canvas
        camera={{ position: [0, 0, 4.8], fov: 45 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        {/* Monochromatic Blue-Violet Ambient & Directional Lighting */}
        <ambientLight intensity={0.45} color="#EDEBFF" />
        <directionalLight position={[3, 4, 3]} intensity={0.65} color="#C7B6FF" />
        <directionalLight position={[-3, -2, 2]} intensity={0.2} color="#0A0A2C" />

        {/* 1. Solid Dark Celestial Body (Scene 1 & 4) */}
        <CelestialSphere progress={0} />

        {/* 2. Glass Evidence Sphere with Comet Docket Streak (Scene 3) */}
        <GlassEvidenceSphere />

        {/* 3. Dotted Fibonacci Globe with Live Detection Pins (Scene 5 & 6) */}
        <DottedGlobeScene />
      </Canvas>
    </div>
  );
}
