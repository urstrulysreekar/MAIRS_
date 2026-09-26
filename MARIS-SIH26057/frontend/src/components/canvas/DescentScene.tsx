'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';

export interface DescentSceneHandle {
  triggerPlunge: (onComplete?: () => void) => void;
  setScrollProgress: (progress: number) => void;
}

interface DescentSceneProps {
  scrollProgress?: number;
  onAnomalyHover?: (name: string | null, x: number, y: number) => void;
}

export const DescentScene = forwardRef<DescentSceneHandle, DescentSceneProps>(
  ({ scrollProgress = 0, onAnomalyHover }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const curveRef = useRef<THREE.CatmullRomCurve3 | null>(null);

    const progressRef = useRef(scrollProgress);
    const targetProgressRef = useRef(scrollProgress);
    const mouseParallax = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
    const isPlunging = useRef(false);

    // Keep progressRef in sync with prop
    useEffect(() => {
      targetProgressRef.current = scrollProgress;
    }, [scrollProgress]);

    useImperativeHandle(ref, () => ({
      setScrollProgress(p: number) {
        targetProgressRef.current = p;
      },
      triggerPlunge(onComplete?: () => void) {
        isPlunging.current = true;
        const startZ = cameraRef.current?.position.z || 0;
        const startTime = performance.now();
        const duration = 700; // ms

        const animatePlunge = (now: number) => {
          const elapsed = now - startTime;
          const t = Math.min(1, elapsed / duration);
          const ease = t * t * (3 - 2 * t);

          if (cameraRef.current) {
            cameraRef.current.position.y -= ease * 12;
            cameraRef.current.position.z -= ease * 18;
            cameraRef.current.rotation.x -= ease * 0.4;
          }

          if (t < 1) {
            requestAnimationFrame(animatePlunge);
          } else {
            onComplete?.();
          }
        };
        requestAnimationFrame(animatePlunge);
      },
    }));

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      // 1. Scene & Fog Setup
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      const fogColor = new THREE.Color(0x070a0f);
      scene.fog = new THREE.FogExp2(fogColor, 0.022);

      // 2. Camera Setup (fov 40)
      const camera = new THREE.PerspectiveCamera(
        40,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      cameraRef.current = camera;

      // 3. WebGL Renderer
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      rendererRef.current = renderer;
      container.appendChild(renderer.domElement);

      // 4. CatmullRomCurve3 Trajectory through 8 Control Points
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 18, 45),    // 0% Surface / Hero
        new THREE.Vector3(2, 8, 32),     // 15% Descent Entry
        new THREE.Vector3(-3, -4, 18),   // 30% Water Column
        new THREE.Vector3(0, -14, 5),    // 45% Seabed Approach
        new THREE.Vector3(4, -20, -12),  // 60% AUV Swath Survey
        new THREE.Vector3(-2, -22, -28), // 72% Ghost Net & Wreck Exhibit
        new THREE.Vector3(3, -21, -44),  // 85% UXO & Pipeline Exhibit
        new THREE.Vector3(0, -18, -62),  // 100% India Coastline Coverage CTA
      ]);
      curveRef.current = curve;

      // 5. Lighting
      const ambientLight = new THREE.AmbientLight(0x0b1018, 1.4);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0x3b7b99, 1.4);
      dirLight.position.set(10, 25, 20);
      scene.add(dirLight);

      const beaconLight = new THREE.PointLight(0x5b937c, 2.5, 45);
      scene.add(beaconLight);

      // ── CHAPTER 1: Surface Ocean Plane with Lat/Lon Grid ──
      const surfaceGeo = new THREE.PlaneGeometry(160, 160, 64, 64);
      const surfaceMat = new THREE.MeshBasicMaterial({
        color: 0x3b7b99,
        wireframe: true,
        transparent: true,
        opacity: 0.08,
      });
      const surfaceMesh = new THREE.Mesh(surfaceGeo, surfaceMat);
      surfaceMesh.rotation.x = -Math.PI / 2;
      surfaceMesh.position.y = 12;
      scene.add(surfaceMesh);

      // ── CHAPTER 2: Water Column Particulates & Light Shafts ──
      const particleCount = 5000;
      const particleGeo = new THREE.BufferGeometry();
      const posArray = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 80;
        posArray[i + 1] = (Math.random() - 0.5) * 60 - 5;
        posArray[i + 2] = (Math.random() - 0.5) * 120 - 10;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

      const particleMat = new THREE.PointsMaterial({
        color: 0x3b7b99,
        size: 0.12,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
      });
      const particulates = new THREE.Points(particleGeo, particleMat);
      scene.add(particulates);

      // Volumetric Light Cones
      const coneGeo = new THREE.ConeGeometry(8, 45, 16, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0x5b937c,
        transparent: true,
        opacity: 0.04,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      for (let c = 0; c < 3; c++) {
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.position.set((c - 1) * 16, 15, -c * 15);
        cone.rotation.z = (c - 1) * 0.15;
        cone.rotation.x = 0.2;
        scene.add(cone);
      }

      // ── CHAPTER 3: Displaced Seabed Bathymetry ──
      const seabedGeo = new THREE.PlaneGeometry(160, 160, 128, 128);
      const posAttr = seabedGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const vx = posAttr.getX(i);
        const vy = posAttr.getY(i);
        const elevation =
          Math.sin(vx * 0.08) * Math.cos(vy * 0.08) * 3.2 +
          Math.sin((vx + vy) * 0.04) * 2.0;
        posAttr.setZ(i, elevation);
      }
      seabedGeo.computeVertexNormals();

      const seabedMat = new THREE.MeshStandardMaterial({
        color: 0x101622,
        roughness: 0.85,
        metalness: 0.2,
        wireframe: true,
      });
      const seabedMesh = new THREE.Mesh(seabedGeo, seabedMat);
      seabedMesh.rotation.x = -Math.PI / 2;
      seabedMesh.position.set(0, -28, -25);
      scene.add(seabedMesh);

      // Procedural AUV Vehicle
      const auvGroup = new THREE.Group();
      const auvBodyGeo = new THREE.CapsuleGeometry(0.8, 4, 8, 16);
      const auvBodyMat = new THREE.MeshStandardMaterial({
        color: 0xd99b26, // Signal Amber
        roughness: 0.3,
        metalness: 0.6,
      });
      const auvBody = new THREE.Mesh(auvBodyGeo, auvBodyMat);
      auvBody.rotation.x = Math.PI / 2;
      auvGroup.add(auvBody);

      // AUV Thrusters & Fin
      const finGeo = new THREE.BoxGeometry(0.15, 1.8, 1.2);
      const finMat = new THREE.MeshStandardMaterial({ color: 0x101622 });
      const fin = new THREE.Mesh(finGeo, finMat);
      fin.position.set(0, 0.6, -1.8);
      auvGroup.add(fin);

      auvGroup.position.set(2, -18, -10);
      scene.add(auvGroup);

      // Sonar Ping Rings
      const ringGeo = new THREE.RingGeometry(0.5, 0.7, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x3b7b99,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      const pingRing = new THREE.Mesh(ringGeo, ringMat);
      pingRing.rotation.x = Math.PI / 2;
      pingRing.position.set(2, -19.5, -10);
      scene.add(pingRing);

      // Diamond Anomaly Marker Instances
      const diamondGeo = new THREE.OctahedronGeometry(0.8);
      const diamondMat = new THREE.MeshBasicMaterial({
        color: 0x3b7b99,
        wireframe: true,
      });
      const instancedDiamonds = new THREE.InstancedMesh(diamondGeo, diamondMat, 8);
      const dummy = new THREE.Object3D();
      const anomalyCoords = [
        [-6, -26, -18],
        [8, -25, -24],
        [-3, -24, -32],
        [5, -24, -40],
        [-8, -25, -48],
      ];
      anomalyCoords.forEach((coord, i) => {
        dummy.position.set(coord[0], coord[1], coord[2]);
        dummy.scale.set(1.2, 1.8, 1.2);
        dummy.updateMatrix();
        instancedDiamonds.setMatrixAt(i, dummy.matrix);
      });
      instancedDiamonds.instanceMatrix.needsUpdate = true;
      scene.add(instancedDiamonds);

      // ── CHAPTER 4: Procedural Exhibits (Ghost Net, Wreck, UXO, Pipeline) ──
      // 1. Ghost Net exhibit (Wavy cloth lattice)
      const netGeo = new THREE.PlaneGeometry(10, 8, 16, 16);
      const netMat = new THREE.MeshBasicMaterial({
        color: 0xd93829,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });
      const ghostNetMesh = new THREE.Mesh(netGeo, netMat);
      ghostNetMesh.position.set(-6, -21, -26);
      ghostNetMesh.rotation.y = 0.4;
      scene.add(ghostNetMesh);

      // 2. Wreck Debris Exhibit (Low-poly fractured hull framing)
      const wreckGeo = new THREE.ConeGeometry(3.5, 9, 5);
      const wreckMat = new THREE.MeshStandardMaterial({
        color: 0x3b7b99,
        roughness: 0.9,
        wireframe: true,
      });
      const wreckMesh = new THREE.Mesh(wreckGeo, wreckMat);
      wreckMesh.rotation.z = Math.PI / 3;
      wreckMesh.position.set(6, -22, -30);
      scene.add(wreckMesh);

      // 3. UXO Cluster Exhibit (Red Heavy Metallic Projectiles)
      const uxoGeo = new THREE.CapsuleGeometry(0.5, 2.2, 8, 16);
      const uxoMat = new THREE.MeshStandardMaterial({
        color: 0xd93829,
        metalness: 0.9,
        roughness: 0.2,
      });
      const uxoMesh = new THREE.Mesh(uxoGeo, uxoMat);
      uxoMesh.rotation.z = 0.6;
      uxoMesh.position.set(-4, -22, -42);
      scene.add(uxoMesh);

      // 4. Subsea Pipeline Exhibit (Curved TubeGeometry)
      const pipeCurve = new THREE.LineCurve3(
        new THREE.Vector3(-15, -25, -46),
        new THREE.Vector3(15, -23, -42)
      );
      const pipeGeo = new THREE.TubeGeometry(pipeCurve, 32, 0.7, 12, false);
      const pipeMat = new THREE.MeshStandardMaterial({
        color: 0x8c978f,
        metalness: 0.6,
        roughness: 0.4,
      });
      const pipeMesh = new THREE.Mesh(pipeGeo, pipeMat);
      scene.add(pipeMesh);

      // ── CHAPTER 5: Stylized India Coastline Polyline ──
      const coastPoints = [
        new THREE.Vector3(-12, -15, -60), // Gujarat / Arabian Sea
        new THREE.Vector3(-10, -18, -61), // Mumbai High
        new THREE.Vector3(-8, -21, -62),  // Goa
        new THREE.Vector3(-6, -24, -63),  // Kochi / Malabar
        new THREE.Vector3(-2, -26, -64),  // Cape Comorin
        new THREE.Vector3(1, -25, -64),   // Gulf of Mannar
        new THREE.Vector3(4, -22, -63),   // Chennai
        new THREE.Vector3(7, -19, -62),   // Visakhapatnam Shelf
        new THREE.Vector3(10, -16, -61),  // Bay of Bengal
        new THREE.Vector3(14, -21, -63),  // Andaman Sea
      ];
      const coastGeo = new THREE.BufferGeometry().setFromPoints(coastPoints);
      const coastMat = new THREE.LineBasicMaterial({
        color: 0x5b937c,
        linewidth: 1.5,
      });
      const coastLine = new THREE.Line(coastGeo, coastMat);
      scene.add(coastLine);

      // 6. Pointer Movement Parallax Listener
      const handleMouseMove = (e: MouseEvent) => {
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = -(e.clientY / window.innerHeight) * 2 + 1;
        mouseParallax.current.targetX = nx * 0.035;
        mouseParallax.current.targetY = ny * 0.035;
      };
      window.addEventListener('mousemove', handleMouseMove);

      // 7. Window Resize Listener
      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener('resize', handleResize);

      // 8. Main Render & Animation Loop
      let animId: number;
      let clock = new THREE.Clock();

      const animate = () => {
        animId = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // Smooth scroll progression interpolation
        progressRef.current += (targetProgressRef.current - progressRef.current) * 0.08;
        const p = Math.max(0, Math.min(0.999, progressRef.current));

        // Smooth mouse parallax
        mouseParallax.current.x += (mouseParallax.current.targetX - mouseParallax.current.x) * 0.05;
        mouseParallax.current.y += (mouseParallax.current.targetY - mouseParallax.current.y) * 0.05;

        // Position camera along CatmullRom trajectory
        if (curve && camera && !isPlunging.current) {
          const camPos = curve.getPointAt(p);
          const lookPos = curve.getPointAt(Math.min(0.999, p + 0.04));

          camera.position.copy(camPos);
          camera.position.x += mouseParallax.current.x * 6;
          camera.position.y += mouseParallax.current.y * 6;

          camera.lookAt(lookPos);
          camera.rotation.z += mouseParallax.current.x * 0.4;
        }

        // Fog color ramping based on depth
        const fogR = THREE.MathUtils.lerp(0.03, 0.02, p);
        const fogG = THREE.MathUtils.lerp(0.04, 0.03, p);
        const fogB = THREE.MathUtils.lerp(0.06, 0.04, p);
        scene.fog?.color.setRGB(fogR, fogG, fogB);

        // Animate AUV and Sonar Ping Ring
        if (pingRing) {
          pingRing.scale.x += delta * 3.5;
          pingRing.scale.y += delta * 3.5;
          (pingRing.material as THREE.MeshBasicMaterial).opacity = Math.max(
            0,
            1 - pingRing.scale.x / 14
          );
          if (pingRing.scale.x > 14) {
            pingRing.scale.set(0.5, 0.5, 0.5);
          }
        }

        // Rotate instanced diamond anomaly markers
        if (instancedDiamonds) {
          instancedDiamonds.rotation.y += delta * 0.6;
        }

        // Water particulate sway
        if (particulates) {
          particulates.rotation.y = time * 0.02;
        }

        // Ghost net cloth sway
        if (ghostNetMesh) {
          ghostNetMesh.rotation.z = Math.sin(time * 0.8) * 0.08;
        }

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animId);
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    }, []);

    return (
      <div
        ref={containerRef}
        className="fixed inset-0 z-0 h-screen w-screen overflow-hidden pointer-events-none"
      />
    );
  }
);

DescentScene.displayName = 'DescentScene';
export default DescentScene;
