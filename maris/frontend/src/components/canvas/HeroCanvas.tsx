'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── Custom GLSL Shaders for Photorealistic, Gritty, Tactile Planet Surface ──

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vPosition = position;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uLightDirection;
  uniform float uOpacity;
  uniform float uTime;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  // ── Permutation Polynomial 3D Simplex Noise ──
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857; // 1.0/7.0
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  // Multi-octave fractal Brownian motion for organic tectonic macro-features
  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.55;
    float frequency = 1.0;
    for (int i = 0; i < 5; i++) {
      value += amplitude * snoise(p * frequency);
      frequency *= 2.08;
      amplitude *= 0.48;
    }
    return value;
  }

  // Ridged multifractal for craggy mountain chains, rift valleys, and crater rims
  float ridgeNoise(vec3 p) {
    float n = abs(snoise(p));
    n = 1.0 - n;
    return n * n;
  }

  // Composite elevation: Macro continents + rift faults + micro-granular rock texture
  float getElevation(vec3 p) {
    // Domain warping
    vec3 warp = vec3(
      fbm(p + vec3(0.0, 1.2, 0.5)),
      fbm(p + vec3(2.3, 0.4, 1.8)),
      fbm(p + vec3(0.8, 3.1, 2.2))
    );

    float macro = fbm(p * 1.6 + warp * 0.45);
    float ridges = ridgeNoise(p * 4.2 + warp * 0.25) * 0.38;
    float microGrit = snoise(p * 24.0) * 0.07 + snoise(p * 48.0) * 0.025;

    return macro + ridges + microGrit;
  }

  // Analytical Normal Perturbation (Finite difference gradient approximation)
  vec3 getPerturbedNormal(vec3 p, vec3 geomNormal) {
    float eps = 0.005;
    float h = getElevation(p);
    float hx = getElevation(p + vec3(eps, 0.0, 0.0));
    float hy = getElevation(p + vec3(0.0, eps, 0.0));
    float hz = getElevation(p + vec3(0.0, 0.0, eps));

    vec3 grad = vec3(hx - h, hy - h, hz - h) / eps;
    return normalize(geomNormal - grad * 0.42);
  }

  // Grounded geological & oceanic palette
  vec3 getAlbedo(float elev, float microNoise) {
    vec3 colAbyss    = vec3(0.028, 0.042, 0.065); // Deep basaltic trench
    vec3 colLowland  = vec3(0.048, 0.072, 0.110); // Ocean basin
    vec3 colPlateau  = vec3(0.085, 0.125, 0.170); // Continental shelf
    vec3 colRidge    = vec3(0.145, 0.205, 0.250); // Weathered granite / mineral ridge
    vec3 colHighland = vec3(0.280, 0.345, 0.385); // High-albedo titanium regolith

    vec3 col;
    if (elev < -0.15) {
      col = mix(colAbyss, colLowland, smoothstep(-0.55, -0.15, elev));
    } else if (elev < 0.20) {
      col = mix(colLowland, colPlateau, smoothstep(-0.15, 0.20, elev));
    } else if (elev < 0.50) {
      col = mix(colPlateau, colRidge, smoothstep(0.20, 0.50, elev));
    } else {
      col = mix(colRidge, colHighland, smoothstep(0.50, 0.85, elev));
    }

    col += vec3(microNoise * 0.02);
    return col;
  }

  void main() {
    if (uOpacity <= 0.001) {
      discard;
    }

    vec3 geomNormal = normalize(vNormal);
    vec3 pos = vPosition;

    float elev = getElevation(pos);
    float micro = snoise(pos * 32.0);
    vec3 albedo = getAlbedo(elev, micro);

    // Gritty surface normal
    vec3 N = getPerturbedNormal(pos, geomNormal);
    vec3 L = normalize(uLightDirection);
    vec3 V = normalize(-vWorldPosition);
    vec3 H = normalize(L + V);

    float NdotL = dot(N, L);

    // ── Dramatic Moody Lighting with Harsh Terminator Line ──
    // Space vacuum day/night boundary with sharp falloff
    float terminator = smoothstep(-0.06, 0.20, NdotL);

    // Micro-facet specular: Matte rough rock, subtle glint on dense lowlands
    float roughness = clamp(0.85 + elev * 0.12, 0.70, 0.98);
    float specPower = mix(28.0, 8.0, roughness);
    float specIntensity = mix(0.14, 0.03, roughness);
    float spec = pow(max(dot(N, H), 0.0), specPower) * specIntensity * terminator;

    // Subtle oceanic bounce light from below
    vec3 bounceDir = normalize(vec3(0.4, -1.0, 0.2));
    float bounceLight = max(dot(N, bounceDir), 0.0) * 0.035;
    vec3 bounceColor = vec3(0.04, 0.08, 0.12) * bounceLight;

    // Minimal deep-space ambient so dark side seamlessly integrates with UI (#070a0f)
    vec3 ambient = vec3(0.012, 0.016, 0.024) * albedo;

    // Atmospheric limb / grazing rim light (cold marine starlight, no gaudy neon glow)
    float rim = pow(1.0 - max(dot(geomNormal, V), 0.0), 4.4);
    float rimSunWeight = smoothstep(-0.25, 0.45, dot(geomNormal, L));
    vec3 rimColor = mix(vec3(0.04, 0.07, 0.12), vec3(0.23, 0.48, 0.60), rimSunWeight);
    vec3 rimLight = rimColor * rim * 0.55;

    // Final composite
    vec3 diffuse = albedo * terminator * 1.20;
    vec3 finalColor = diffuse + vec3(spec) + ambient + bounceColor + rimLight;

    gl_FragColor = vec4(finalColor, uOpacity);
  }
`;

function PhotorealisticPlanet() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const currentOpacity = useRef(0);
  const lastScrollY = useRef(0);

  // Set up uniforms
  const uniforms = useMemo(
    () => ({
      uLightDirection: { value: new THREE.Vector3(-1.8, 1.1, 1.4).normalize() },
      uOpacity: { value: 0.0 },
      uTime: { value: 0.0 },
    }),
    []
  );

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;

    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    const time = state.clock.getElapsedTime();
    materialRef.current.uniforms.uTime.value = time;

    // ── Scroll-tied Opacity Fade Mechanics ──
    // At the absolute top (scrollY <= 0), opacity is 0.
    // As the user scrolls down, it smoothly fades in over the first 280px.
    // When scrolling back to the absolute top, it smoothly fades back out to 0 and disappears.
    const fadeThreshold = 280;
    const scrollFactor = THREE.MathUtils.clamp(scrollY / fadeThreshold, 0, 1);
    // Smooth hermite curve for natural cinematic fade
    const targetOpacity = scrollFactor * scrollFactor * (3.0 - 2.0 * scrollFactor);

    currentOpacity.current = THREE.MathUtils.lerp(
      currentOpacity.current,
      targetOpacity,
      Math.min(delta * 5.5, 1.0)
    );

    materialRef.current.uniforms.uOpacity.value = currentOpacity.current;
    meshRef.current.visible = currentOpacity.current > 0.001;

    // ── Scroll Parallax & Axial Rotation ──
    // Slow continuous orbital rotation combined with subtle scroll speed boost
    const scrollDelta = scrollY - lastScrollY.current;
    lastScrollY.current = scrollY;

    meshRef.current.rotation.y += delta * 0.035 + scrollDelta * 0.0006;

    // Subtle parallax translation along Y and Z depth
    const parallaxY = -scrollY * 0.00055;
    const parallaxZ = -scrollY * 0.00025;
    meshRef.current.position.y = parallaxY;
    meshRef.current.position.z = parallaxZ;

    // Responsive scale adaptation for mobile/tablet screens
    const isMobile = state.size.width < 768;
    const baseScale = isMobile ? 0.78 : 1.0;
    meshRef.current.scale.setScalar(baseScale);
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 0, 0]}
      rotation={[0.22, 0, -0.12]} // Realistic 13-degree axial inclination
    >
      {/* High-subdivision sphere for crisp planetary curvature */}
      <sphereGeometry args={[2.25, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function HeroCanvas() {
  return (
    <div
      className="pointer-events-none"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 5.4], fov: 45 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <PhotorealisticPlanet />
      </Canvas>
    </div>
  );
}
