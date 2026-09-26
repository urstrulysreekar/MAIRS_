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
    <div className={`relative overflow-hidden rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018] ${className}`}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full object-cover"
        style={{ width: '100%', height: '100%' }}
      />
      <div className="absolute top-1.5 left-2 flex items-center gap-1 font-mono text-[9px] font-bold text-[#3b7b99] uppercase">
        <span>●</span>
        ACOUSTIC CH-1 (900 kHz)
      </div>
    </div>
  );
}
