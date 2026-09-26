'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  Polyline,
  Polygon,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Anomaly, Survey, HazardClass, MARIS_SURVEY_ZONES } from '@/lib/demo';
import { HAZARD_DISPLAY_CONFIG, HazardBadge, SeverityPill, StatusChip } from './ui/Badge';
import {
  Compass,
  MapPin,
  Layers,
  Ruler,
  Maximize2,
  Crosshair,
  Radio,
  Eye,
  Sliders,
  Filter,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import clsx from 'clsx';
import SonarThumbnail from './ui/SonarThumbnail';

// Fix Leaflet's default marker icon paths in Next.js safely
if (typeof window !== 'undefined') {
  try {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  } catch {
    // Ignore during SSR
  }
}

// Custom DivIcon generator per hazard class
function createMarkerIcon(hazardClass: HazardClass, isSelected: boolean, isRecent: boolean) {
  const conf = HAZARD_DISPLAY_CONFIG[hazardClass] || HAZARD_DISPLAY_CONFIG.geological;
  const size = isSelected ? 34 : 24;

  return L.divIcon({
    className: 'custom-maris-marker',
    html: `
      <div class="relative flex items-center justify-center" style="width:${size}px; height:${size}px;">
        ${
          isRecent || isSelected
            ? `<span class="absolute inline-flex h-full w-full rounded-full animate-ping opacity-75" style="background-color: ${conf.color};"></span>`
            : ''
        }
        <span class="relative inline-flex items-center justify-center rounded-full border-2 shadow-xl transition-transform hover:scale-125"
              style="width:${size}px; height:${size}px; background-color: #0a1120; border-color: ${
      isSelected ? '#ffffff' : conf.color
    }; box-shadow: 0 0 ${isSelected ? '14px' : '6px'} ${conf.color};">
          <span class="h-2 w-2 rounded-full" style="background-color: ${conf.color};"></span>
        </span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// Controller to smoothly fly to coordinates when target or zone is selected
function MapFlyController({
  targetCoord,
  zoomLevel = 13,
}: {
  targetCoord: [number, number] | null;
  zoomLevel?: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (targetCoord) {
      map.flyTo(targetCoord, zoomLevel, { animate: true, duration: 1.4 });
    }
  }, [targetCoord, zoomLevel, map]);
  return null;
}

// Map event listener for cursor coordinates & measure tool
function MapInteractionListener({
  onMouseMove,
  onClick,
}: {
  onMouseMove: (lat: number, lng: number) => void;
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    mousemove(e) {
      onMouseMove(e.latlng.lat, e.latlng.lng);
    },
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface LiveMapProps {
  anomalies: Anomaly[];
  surveys: Survey[];
  selectedAnomalyId?: string | null;
  onSelectAnomaly?: (anomaly: Anomaly) => void;
}

export default function LiveMap({
  anomalies,
  surveys,
  selectedAnomalyId,
  onSelectAnomaly,
}: LiveMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [cursorPos, setCursorPos] = useState<[number, number]>([9.12, 79.25]);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showSwaths, setShowSwaths] = useState(true);
  const [showTracks, setShowTracks] = useState(true);
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Default initial center: Gulf of Mannar
  const initialCenter: [number, number] = [9.12, 79.25];

  const activeSelected = useMemo(() => {
    return anomalies.find((a) => a.id === selectedAnomalyId) || null;
  }, [anomalies, selectedAnomalyId]);

  // Memoize the computed fly coordinate to prevent new array reference on every mousemove render
  const computedFlyTarget = useMemo<[number, number] | null>(() => {
    if (flyTarget) return flyTarget;
    if (activeSelected) return [activeSelected.latitude, activeSelected.longitude];
    return null;
  }, [flyTarget, activeSelected]);

  // Calculate distance between measure points
  const measuredDistanceKm = useMemo(() => {
    if (measurePoints.length < 2) return null;
    const p1 = measurePoints[0];
    const p2 = measurePoints[1];
    const R = 6371; // Earth radius in km
    const dLat = ((p2[0] - p1[0]) * Math.PI) / 180;
    const dLon = ((p2[1] - p1[1]) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((p1[0] * Math.PI) / 180) *
        Math.cos((p2[0] * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  }, [measurePoints]);

  const handleMapClick = (lat: number, lng: number) => {
    if (measureMode) {
      if (measurePoints.length >= 2) {
        setMeasurePoints([[lat, lng]]);
      } else {
        setMeasurePoints([...measurePoints, [lat, lng]]);
      }
    }
  };

  // Memoized Rendered Anomaly Markers
  const renderedMarkers = useMemo(() => {
    return anomalies.map((item, index) => {
      const isSelected = item.id === selectedAnomalyId;
      const isRecent = Date.now() - new Date(item.timestamp).getTime() < 30000;

      return (
        <Marker
          key={`${item.id}-${index}`}
          position={[item.latitude, item.longitude]}
          icon={createMarkerIcon(item.hazardClass, isSelected, isRecent)}
          eventHandlers={{
            click: () => {
              setFlyTarget(null);
              onSelectAnomaly?.(item);
            },
          }}
        >
          <Popup className="custom-maris-popup">
            <div className="min-w-[240px] p-1 font-sans text-slate-100">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                <HazardBadge hazardClass={item.hazardClass} size="sm" />
                <SeverityPill severity={item.severity} />
              </div>

              <div className="mt-2 space-y-1 text-xs">
                <p className="font-bold text-white leading-snug">{item.label}</p>
                <div className="flex justify-between font-mono text-[11px] text-slate-400">
                  <span>Confidence:</span>
                  <span className="font-bold text-emerald-400">
                    {(item.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between font-mono text-[11px] text-slate-400">
                  <span>Depth / Altitude:</span>
                  <span className="text-slate-200">
                    {item.depthM}m / {item.altitudeM}m
                  </span>
                </div>
                <div className="flex justify-between font-mono text-[10px] text-slate-500">
                  <span>Coords:</span>
                  <span>
                    {item.latitude.toFixed(4)}°N, {item.longitude.toFixed(4)}°E
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFlyTarget(null);
                    onSelectAnomaly?.(item);
                  }}
                  className="w-full rounded bg-cyan-500/20 border border-cyan-500/40 py-1 font-mono text-[10px] font-bold text-cyan-300 hover:bg-cyan-500/30"
                >
                  Inspect Waterfall &amp; Metadata →
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      );
    });
  }, [anomalies, selectedAnomalyId, onSelectAnomaly]);

  // Memoized Heatmap Markers
  const renderedHeatmap = useMemo(() => {
    return anomalies.map((a, index) => (
      <CircleMarker
        key={`heat-${a.id}-${index}`}
        center={[a.latitude, a.longitude]}
        radius={a.severity === 'critical' ? 38 : 22}
        pathOptions={{
          color: a.severity === 'critical' ? '#ff3b5c' : '#f59e0b',
          fillColor: a.severity === 'critical' ? '#ff3b5c' : '#f59e0b',
          fillOpacity: 0.25,
          weight: 0,
        }}
      />
    ));
  }, [anomalies]);

  // Memoized Survey Swaths & Tracks
  const renderedSwaths = useMemo(() => {
    return surveys.map((srv) => (
      <Polygon
        key={`swath-${srv.id}`}
        positions={srv.swathPolygon}
        pathOptions={{
          color: '#00f0ff',
          fillColor: '#00f0ff',
          fillOpacity: 0.08,
          weight: 1,
          dashArray: '3, 3',
        }}
      />
    ));
  }, [surveys]);

  const renderedTracks = useMemo(() => {
    return surveys.map((srv) => (
      <Polyline
        key={`track-${srv.id}`}
        positions={srv.trackLine}
        pathOptions={{
          color: '#38bdf8',
          weight: 2,
          opacity: 0.65,
        }}
      />
    ));
  }, [surveys]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-[#060a12] shadow-2xl">
      {/* ── Top Floating Telemetry Overlay ── */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-wrap items-center gap-2">
        {/* Fly to Maritime Zone Selector */}
        <select
          onChange={(e) => {
            const z = MARIS_SURVEY_ZONES[e.target.value];
            if (z) {
              setFlyTarget([z.centerLat, z.centerLng]);
            } else {
              setFlyTarget(null);
            }
          }}
          className="rounded-xl border border-[var(--color-border)] bg-[#0a1120]/95 px-3 py-1.5 font-mono text-xs font-bold text-cyan-300 shadow-xl backdrop-blur-xl focus:outline-none"
        >
          <option value="">-- Jump to Survey Zone --</option>
          {Object.entries(MARIS_SURVEY_ZONES).map(([key, val]) => (
            <option key={key} value={key}>
              {val.name}
            </option>
          ))}
        </select>

        {/* Map View Mode Toggles */}
        <div className="flex items-center rounded-xl border border-[var(--color-border)] bg-[#0a1120]/95 p-1 shadow-xl backdrop-blur-xl text-xs font-mono">
          <button
            onClick={() => setShowSwaths(!showSwaths)}
            className={clsx(
              'rounded-lg px-2.5 py-1 transition-colors',
              showSwaths ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
            )}
          >
            Swaths
          </button>
          <button
            onClick={() => setShowTracks(!showTracks)}
            className={clsx(
              'rounded-lg px-2.5 py-1 transition-colors',
              showTracks ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
            )}
          >
            Tracklines
          </button>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={clsx(
              'flex items-center gap-1 rounded-lg px-2.5 py-1 transition-colors',
              showHeatmap ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-400 hover:text-white'
            )}
          >
            <Flame className="h-3 w-3" /> Heatmap
          </button>
          <button
            onClick={() => {
              setMeasureMode(!measureMode);
              setMeasurePoints([]);
            }}
            className={clsx(
              'flex items-center gap-1 rounded-lg px-2.5 py-1 transition-colors',
              measureMode ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
            )}
          >
            <Ruler className="h-3 w-3" /> Measure
          </button>
        </div>
      </div>

      {/* Realtime Stream Badge in Top Right */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2 rounded-full border border-cyan-500/40 bg-[#0a1120]/90 px-3.5 py-1.5 shadow-xl backdrop-blur-md">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 animate-ping"></span>
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500"></span>
        </span>
        <span className="font-mono text-xs font-semibold tracking-wider text-slate-200">
          POSTGIS REALTIME ({anomalies.length} TARGETS)
        </span>
      </div>

      {/* Measurement readout toast */}
      {measureMode && (
        <div className="absolute top-16 left-4 z-[1000] rounded-xl border border-amber-500/50 bg-[#0d1627]/95 p-3 shadow-2xl backdrop-blur-xl text-xs font-mono text-amber-200">
          <p className="font-bold flex items-center gap-1.5">
            <Ruler className="h-4 w-4 text-amber-400" /> Acoustic Swath Distance Tool
          </p>
          <p className="text-[11px] text-slate-300 mt-1">
            {measurePoints.length === 0 && 'Click anywhere on seabed to place Point 1'}
            {measurePoints.length === 1 && 'Click second location on seabed to compute distance'}
            {measurePoints.length === 2 && (
              <span className="text-white font-bold text-sm">
                Distance: {measuredDistanceKm} km ({(Number(measuredDistanceKm) * 1000).toFixed(0)} m)
              </span>
            )}
          </p>
        </div>
      )}

      {/* ── Main Map Canvas (CARTO Dark Matter) with Hardware Canvas Acceleration ── */}
      {isMounted && (
        <MapContainer
          center={initialCenter}
          zoom={7}
          className="h-full w-full"
          scrollWheelZoom={true}
          preferCanvas={true}
        >
          <MapFlyController
            targetCoord={computedFlyTarget}
          />
          <MapInteractionListener
            onMouseMove={(lat, lng) => setCursorPos([lat, lng])}
            onClick={handleMapClick}
          />

          {/* Free, Keyless Esri World Dark Gray Nautical Basemap */}
          <TileLayer
            attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />

          {/* Survey Tracklines & Coverage Swath Polygons */}
          {showSwaths && renderedSwaths}
          {showTracks && renderedTracks}

          {/* Heatmap Density Mode */}
          {showHeatmap && renderedHeatmap}

          {/* Distance Measurement Line */}
          {measurePoints.length === 2 && (
            <Polyline
              positions={measurePoints}
              pathOptions={{ color: '#f59e0b', weight: 3, dashArray: '6, 6' }}
            />
          )}

          {/* Target Anomaly Markers */}
          {!showHeatmap && renderedMarkers}
        </MapContainer>
      )}

      {/* ── Bottom Left Taxonomy Legend ── */}
      <div className="absolute bottom-6 left-6 z-[1000] rounded-xl border border-[var(--color-border)] bg-[#0a1120]/95 p-3.5 shadow-2xl backdrop-blur-xl">
        <p className="mb-2 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-300">
          <Compass className="h-3.5 w-3.5 text-cyan-400" /> Sonar Hazard Taxonomy
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          {Object.entries(HAZARD_DISPLAY_CONFIG).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full ring-2 ring-white/10"
                style={{ backgroundColor: value.color }}
              ></span>
              <span className="text-slate-300 text-[11px]">{value.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Right Live Cursor Telemetry Readout ── */}
      <div className="absolute bottom-6 right-6 z-[1000] rounded-xl border border-[var(--color-border)] bg-[#0a1120]/95 px-3.5 py-2 shadow-2xl backdrop-blur-xl font-mono text-xs text-slate-300 flex items-center gap-4">
        <div>
          <span className="text-[10px] text-slate-500 block">CURSOR COORDINATES</span>
          <span className="text-cyan-400 font-bold">
            {cursorPos[0].toFixed(5)}°N, {cursorPos[1].toFixed(5)}°E
          </span>
        </div>
        <div className="border-l border-[var(--color-border)] pl-3">
          <span className="text-[10px] text-slate-500 block">EPSG / DATUM</span>
          <span className="text-white font-semibold">4326 (WGS84)</span>
        </div>
      </div>
    </div>
  );
}
