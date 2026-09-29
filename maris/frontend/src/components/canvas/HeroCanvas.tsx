'use client';

import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// ── Verified Earth-at-Night & Surface Topography Texture Maps ──
const TEXTURE_URLS = {
  // Diffuse Earth at Night showing glowing cities & illuminated coasts
  map: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_lights_2048.png',
  // High-frequency elevation normal map for extreme terrain relief
  normalMap: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_normal_2048.jpg',
  // Specular/roughness map allowing oceans to reflect while land absorbs
  roughnessMap: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_specular_2048.jpg',
};

// ── Cyber-Intelligence 3D Earth with Dual-Lighting & Gradient Atmospheric Rim ──
function CyberNightPlanet() {
  const groupRef = useRef<THREE.Group>(null);
  const planetMeshRef = useRef<THREE.Mesh>(null);
  const planetMatRef = useRef<THREE.MeshStandardMaterial>(null);

  const currentOpacity = useRef(1);
  const currentY = useRef(0);

  // Load high-resolution Earth textures via Drei
  const textures = useTexture(TEXTURE_URLS);

  // Soft Cyan-to-Purple Atmospheric Rim Shader
  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uOpacity: { value: 1.0 },
        uColorCyan: { value: new THREE.Color('#06b6d4') },
        uColorPurple: { value: new THREE.Color('#a855f7') },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        uniform vec3 uColorCyan;
        uniform vec3 uColorPurple;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 viewDir = normalize(-vPosition);
          float dotNV = dot(viewDir, vNormal);
          // Soft Fresnel falloff: transparent inside, luminous at rim
          float fresnel = pow(1.0 - clamp(dotNV, 0.0, 1.0), 2.8);
          
          // Dual-tone gradient blending from bottom-left cyan to top-right purple
          float t = clamp((vPosition.y * 0.6 - vPosition.x * 0.5 + 1.5) / 3.0, 0.0, 1.0);
          vec3 haloColor = mix(uColorCyan, uColorPurple, t);
          
          gl_FragColor = vec4(haloColor, fresnel * 0.55 * uOpacity);
        }
      `,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
    });
  }, []);

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

    // Synchronize material and atmospheric rim opacity
    planetMatRef.current.opacity = currentOpacity.current;
    if (atmosphereMaterial.uniforms.uOpacity) {
      atmosphereMaterial.uniforms.uOpacity.value = currentOpacity.current;
    }
    groupRef.current.visible = currentOpacity.current > 0.001;

    // ── Scroll Parallax ──
    const targetY = scrollY * 0.0008;
    currentY.current = THREE.MathUtils.lerp(
      currentY.current,
      targetY,
      Math.min(delta * 4.0, 1)
    );
    groupRef.current.position.y = currentY.current;

    // ── Slow Planetary Axial Rotation ──
    if (planetMeshRef.current) {
      planetMeshRef.current.rotation.y += delta * 0.04;
      planetMeshRef.current.rotation.x = 0.15; // Subtle axial tilt
      planetMeshRef.current.rotation.z = -0.06;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* ── 1. Main Earth at Night with Glowing City Lights & Terrain Relief ── */}
      <mesh ref={planetMeshRef}>
        <sphereGeometry args={[2.4, 64, 64]} />
        <meshStandardMaterial
          ref={planetMatRef}
          map={textures.map}
          emissiveMap={textures.map}
          emissive="#38bdf8"
          emissiveIntensity={0.7}
          normalMap={textures.normalMap}
          normalScale={new THREE.Vector2(3.5, 3.5)}
          roughnessMap={textures.roughnessMap}
          roughness={0.72}
          metalness={0.18}
          color="#0c1726" // Deep navy night base
          transparent={true}
          opacity={1}
        />
      </mesh>

      {/* ── 2. Atmospheric Rim: scale={1.02} with Soft Cyan/Purple Gradient Halo ── */}
      <mesh scale={1.02}>
        <sphereGeometry args={[2.4, 64, 64]} />
        <primitive object={atmosphereMaterial} attach="material" />
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
          {/* Subtle colored cyber ambient light */}
          <ambientLight intensity={0.06} color="#0c182b" />

          {/* ── Vibrant Dual-Tone PointLighting ── */}
          {/* 1. Strong Cyan PointLight on the bottom-left */}
          <pointLight
            position={[-4.5, -3.0, 2.2]}
            intensity={18}
            color="#06b6d4"
            distance={22}
            decay={1.8}
          />
          <pointLight
            position={[-3.2, -1.8, -0.8]}
            intensity={9}
            color="#0891b2"
            distance={15}
            decay={2}
          />

          {/* 2. Deep Purple/Magenta PointLight on the top-right */}
          <pointLight
            position={[4.5, 3.0, 2.2]}
            intensity={18}
            color="#a855f7"
            distance={22}
            decay={1.8}
          />
          <pointLight
            position={[3.2, 1.8, -0.8]}
            intensity={9}
            color="#c026d3"
            distance={15}
            decay={2}
          />

          {/* Earth at Night */}
          <CyberNightPlanet />
        </Suspense>
      </Canvas>
    </div>
  );
}
