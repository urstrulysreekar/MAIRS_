'use client';

import React from 'react';

export default function TopographicBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none -z-20 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* ── Tactical Bathymetric Contours & Network Nodes SVG Layer ── */}
      <svg
        className="w-full h-full opacity-30 object-cover"
        viewBox="0 0 1920 1080"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Subtle Cyber Gradients for Contours & Links */}
          <linearGradient id="topo-cyan-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="topo-purple-grad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#818cf8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
          </linearGradient>

          <pattern id="tactical-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="0.5"
              strokeOpacity="0.08"
            />
            {/* Grid coordinate tick */}
            <circle cx="0" cy="0" r="1" fill="#38bdf8" fillOpacity="0.25" />
          </pattern>
        </defs>

        {/* Faint Tactical Background Grid */}
        <rect width="100%" height="100%" fill="url(#tactical-grid)" />

        {/* ── Topographic Bathymetric Elevation Contour Lines ── */}
        <g strokeWidth="1.2" fill="none">
          {/* Bottom-left rising shelf lines (Cyan dominant) */}
          <path
            d="M -100 850 C 250 820, 450 940, 750 880 C 1050 820, 1300 960, 1600 900 C 1800 860, 2000 920, 2100 910"
            stroke="url(#topo-cyan-grad)"
            strokeOpacity="0.5"
          />
          <path
            d="M -80 760 C 280 730, 490 840, 790 790 C 1090 740, 1350 860, 1640 810 C 1840 780, 2020 830, 2120 820"
            stroke="url(#topo-cyan-grad)"
            strokeOpacity="0.4"
          />
          <path
            d="M -60 670 C 310 630, 530 740, 830 690 C 1130 640, 1400 760, 1680 710 C 1880 680, 2040 730, 2140 720"
            stroke="url(#topo-cyan-grad)"
            strokeOpacity="0.3"
            strokeDasharray="8 4"
          />
          <path
            d="M -40 580 C 340 530, 570 640, 870 590 C 1170 540, 1450 660, 1720 610 C 1910 580, 2060 620, 2160 610"
            stroke="url(#topo-cyan-grad)"
            strokeOpacity="0.25"
          />

          {/* Top-right deep trench & ridgelines (Purple/Magenta dominant) */}
          <path
            d="M -100 220 C 300 180, 600 320, 950 250 C 1300 180, 1550 300, 1850 220 C 1980 190, 2100 230, 2200 210"
            stroke="url(#topo-purple-grad)"
            strokeOpacity="0.5"
          />
          <path
            d="M -80 310 C 330 270, 640 400, 990 330 C 1340 260, 1600 380, 1900 300 C 2010 270, 2120 310, 2220 290"
            stroke="url(#topo-purple-grad)"
            strokeOpacity="0.4"
          />
          <path
            d="M -60 400 C 360 360, 680 480, 1030 410 C 1380 340, 1650 460, 1950 380 C 2040 350, 2140 390, 2240 370"
            stroke="url(#topo-purple-grad)"
            strokeOpacity="0.3"
            strokeDasharray="6 6"
          />

          {/* Concentric Seamount Loops (Mid-Field) */}
          <path
            d="M 320 480 C 420 420, 560 460, 540 560 C 520 640, 390 650, 310 590 C 260 540, 270 500, 320 480 Z"
            stroke="#06b6d4"
            strokeOpacity="0.3"
          />
          <path
            d="M 350 495 C 420 455, 520 480, 505 550 C 490 610, 400 620, 345 575 C 310 540, 315 510, 350 495 Z"
            stroke="#38bdf8"
            strokeOpacity="0.22"
          />
          <path
            d="M 1480 380 C 1600 320, 1740 370, 1710 470 C 1680 550, 1530 560, 1450 500 C 1390 440, 1420 400, 1480 380 Z"
            stroke="#a855f7"
            strokeOpacity="0.35"
          />
          <path
            d="M 1510 400 C 1590 355, 1690 390, 1670 460 C 1650 520, 1540 530, 1480 485 C 1435 445, 1460 415, 1510 400 Z"
            stroke="#c084fc"
            strokeOpacity="0.25"
          />
        </g>

        {/* ── Tactical Sensor Constellation Network Nodes & Links ── */}
        <g stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3 5" opacity="0.45">
          <line x1="280" y1="260" x2="420" y2="380" />
          <line x1="420" y1="380" x2="680" y2="340" />
          <line x1="680" y1="340" x2="860" y2="480" />
          <line x1="860" y1="480" x2="1140" y2="420" />
          <line x1="1140" y1="420" x2="1360" y2="320" />
          <line x1="1360" y1="320" x2="1580" y2="440" />
          <line x1="1580" y1="440" x2="1750" y2="310" />

          {/* Cross vectors */}
          <line x1="420" y1="380" x2="320" y2="580" stroke="#06b6d4" />
          <line x1="860" y1="480" x2="780" y2="680" stroke="#06b6d4" />
          <line x1="1140" y1="420" x2="1280" y2="620" stroke="#a855f7" />
          <line x1="1360" y1="320" x2="1520" y2="210" stroke="#a855f7" />
        </g>

        {/* Network Node Vertices */}
        <g>
          {[
            { cx: 280, cy: 260, color: '#06b6d4', label: 'ND-01' },
            { cx: 420, cy: 380, color: '#38bdf8', label: 'SN-04' },
            { cx: 680, cy: 340, color: '#06b6d4', label: 'ND-09' },
            { cx: 860, cy: 480, color: '#22d3ee', label: 'C2-ARRAY' },
            { cx: 1140, cy: 420, color: '#c084fc', label: 'TR-12' },
            { cx: 1360, cy: 320, color: '#a855f7', label: 'RELAY-B' },
            { cx: 1580, cy: 440, color: '#d946ef', label: 'SN-17' },
            { cx: 1750, cy: 310, color: '#a855f7', label: 'ND-22' },
            { cx: 320, cy: 580, color: '#06b6d4', label: 'DEP-840m' },
            { cx: 780, cy: 680, color: '#0891b2', label: 'DEP-1200m' },
            { cx: 1280, cy: 620, color: '#9333ea', label: 'DEP-2450m' },
            { cx: 1520, cy: 210, color: '#c084fc', label: 'GRID-A9' },
          ].map((node) => (
            <g key={`${node.cx}-${node.cy}`}>
              {/* Outer pulse ring */}
              <circle
                cx={node.cx}
                cy={node.cy}
                r="6"
                fill="none"
                stroke={node.color}
                strokeWidth="0.8"
                opacity="0.4"
              />
              {/* Inner solid node */}
              <circle
                cx={node.cx}
                cy={node.cy}
                r="2.5"
                fill={node.color}
                opacity="0.9"
              />
              {/* Telemetry coordinate label */}
              <text
                x={node.cx + 9}
                y={node.cy + 3}
                fill={node.color}
                fontSize="8"
                fontFamily="monospace"
                letterSpacing="1px"
                opacity="0.6"
              >
                {node.label}
              </text>
            </g>
          ))}
        </g>

        {/* ── Tactical Crosshairs & Lat/Long Coordinate Grid Markers ── */}
        <g stroke="#ffffff" strokeWidth="0.8" opacity="0.3">
          {[
            { x: 180, y: 150 },
            { x: 960, y: 120 },
            { x: 1720, y: 160 },
            { x: 220, y: 880 },
            { x: 960, y: 920 },
            { x: 1700, y: 860 },
          ].map((cross, idx) => (
            <g key={idx}>
              <line x1={cross.x - 6} y1={cross.y} x2={cross.x + 6} y2={cross.y} />
              <line x1={cross.x} y1={cross.y - 6} x2={cross.x} y2={cross.y + 6} />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
