'use client';

import React, { useEffect, useRef } from 'react';
import { HazardClass } from '@/lib/demo/types';
import { drawSonarCanvas } from '@/lib/demo/proceduralSonar';

interface SonarThumbnailProps {
  hazardClass: HazardClass;
  seed: number;
  width?: number;
  height?: number;
  className?: string;
}

export default function SonarThumbnail({
  hazardClass,
  seed,
  width = 240,
  height = 140,
  className = '',
}: SonarThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      drawSonarCanvas(canvasRef.current, hazardClass, seed, width, height);
    }
  }, [hazardClass, seed, width, height]);

  return (
    <div className={`relative overflow-hidden rounded-lg border border-[var(--color-border)] bg-[#0c121e] ${className}`}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full object-cover"
        style={{ width: '100%', height: '100%' }}
      />
      <div className="absolute top-1.5 left-2 flex items-center gap-1 font-mono text-[9px] font-bold text-cyan-400/80 uppercase">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
        ACOUSTIC CH-1 (900 kHz)
      </div>
    </div>
  );
}
