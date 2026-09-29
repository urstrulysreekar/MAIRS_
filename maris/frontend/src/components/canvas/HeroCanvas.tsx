'use client';

import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// ── Vibrant Daytime Earth / Oceanic Exoplanet Textures ──
const TEXTURE_URLS = {
  // Rich deep-sea blues, lush green continents & dynamic white cloud cover
  map: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_atmos_2048.jpg',
  // High-resolution terrain elevation normal map
  normalMap: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_normal_2048.jpg',
  // Specular map: reflective oceans, matte landmasses
  specularMap: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_specular_2048.jpg',
};

// ── Realistic Vibrant Oceanic Celestial Body ──
function VibrantEarthPlanet() {
  const groupRef = useRef<THREE.Group>(null);
  const planetMeshRef = useRef<THREE.Mesh>(null);
  const planetMatRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const currentOpacity = useRef(1);
  const currentY = useRef(0);

  // Load high-resolution natural textures
  const textures = useTexture(TEXTURE_URLS);

  // Soft atmospheric halo with extreme feathering (high Fresnel exponent) - NO HARD BORDER
  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uOpacity: { value: 1.0 },
        uColor: { value: new THREE.Color('#38bdf8') }, // Soft azure atmospheric tint
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
        uniform vec3 uColor;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 viewDir = normalize(-vPosition);
          float dotNV = dot(viewDir, vNormal);
          // Extreme feathering with power 4.8: zero hard outline, seamless gradient falloff
          float fresnel = pow(1.0 - clamp(dotNV, 0.0, 1.0), 4.8);
          // Atmosphere only illuminates along the sunlit right limb
          float sunAlignment = clamp(vNormal.x * 2.0 + 0.1, 0.0, 1.0);
          gl_FragColor = vec4(uColor, fresnel * sunAlignment * 0.7 * uOpacity);
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

    // Apply synchronized opacity
    planetMatRef.current.opacity = currentOpacity.current;
    if (atmosphereMaterial.uniforms.uOpacity) {
      atmosphereMaterial.uniforms.uOpacity.value = currentOpacity.current;
    }
    groupRef.current.visible = currentOpacity.current > 0.001;

    // ── Scroll Parallax (Y-Axis) ──
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
      planetMeshRef.current.rotation.x = 0.16; // Natural axial tilt
      planetMeshRef.current.rotation.z = -0.06;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* ── 1. Main Vibrant Earth Body with MeshPhysicalMaterial ── */}
      <mesh ref={planetMeshRef}>
        <sphereGeometry args={[2.4, 64, 64]} />
        <meshPhysicalMaterial
          ref={planetMatRef}
          map={textures.map}
          normalMap={textures.normalMap}
          normalScale={new THREE.Vector2(2.8, 2.8)} // Enhanced relief pop along terminator line
          roughnessMap={textures.specularMap}
          metalnessMap={textures.specularMap}
          roughness={0.38} // Oceans glint specularly while land remains matte
          metalness={0.22}
          clearcoat={0.35}
          clearcoatRoughness={0.2}
          transparent={true}
          opacity={1}
        />
      </mesh>

      {/* ── 2. Subtle Soft Atmospheric Halo along illuminated right limb ── */}
      <mesh scale={1.018}>
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
          {/* Deep dark navy ambient light so shadow hemisphere falls into heavy realistic darkness */}
          <ambientLight intensity={0.03} color="#0c1322" />

          {/* Stark warm Sunlight positioned directly to the right creating half-dark phase */}
          <directionalLight
            position={[11, 0.8, 1.8]}
            intensity={12}
            color="#fdf4dc"
          />

          {/* Realistic Vibrant Earth */}
          <VibrantEarthPlanet />
        </Suspense>
      </Canvas>
    </div>
  );
}
