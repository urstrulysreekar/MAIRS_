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
            ? `<span class="absolute inline-flex h-full w-full rounded-full opacity-40 border" style="border-color: ${conf.color};"></span>`
            : ''
        }
        <span class="relative inline-flex items-center justify-center rounded-full border-2 transition-transform"
              style="width:${size}px; height:${size}px; background-color: #0b1018; border-color: ${
      isSelected ? '#e2e8e4' : conf.color
    };">
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
    return anomalies.find(
      (a) => a.id === selectedAnomalyId && a.latitude != null && a.longitude != null
    ) || null;
  }, [anomalies, selectedAnomalyId]);

  // Memoize the computed fly coordinate to prevent new array reference on every mousemove render
  const computedFlyTarget = useMemo<[number, number] | null>(() => {
    if (flyTarget) return flyTarget;
    if (activeSelected?.latitude != null && activeSelected.longitude != null) {
      return [activeSelected.latitude, activeSelected.longitude];
    }
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
    return anomalies
      .filter((item) => item.latitude != null && item.longitude != null)
      .map((item, index) => {
        const isSelected = item.id === selectedAnomalyId;
        const isRecent = Date.now() - new Date(item.timestamp).getTime() < 30000;

        return (
          <Marker
            key={`${item.id}-${index}`}
            position={[item.latitude!, item.longitude!]}
            icon={createMarkerIcon(item.hazardClass, isSelected, isRecent)}
            eventHandlers={{
              click: () => {
                setFlyTarget(null);
                onSelectAnomaly?.(item);
              },
            }}
          >
          <Popup className="custom-maris-popup">
            <div className="min-w-[240px] p-1 font-sans text-[#e2e8e4]">
              <div className="flex items-center justify-between border-b border-[rgba(226,232,228,0.08)] pb-2">
                <HazardBadge hazardClass={item.hazardClass} size="sm" />
                <SeverityPill severity={item.severity} />
              </div>

              <div className="mt-2 space-y-1 text-xs">
                <p className="font-bold text-white leading-snug">{item.label}</p>
                <div className="flex justify-between font-mono text-[11px] text-[#8c978f]">
                  <span>Confidence:</span>
                  <span className="font-bold text-[#5b937c]">
                    {item.confidence == null ? 'Not recorded' : `${(item.confidence * 100).toFixed(1)}%`}
                  </span>
                </div>
                <div className="flex justify-between font-mono text-[11px] text-[#8c978f]">
                  <span>Depth / Altitude:</span>
                  <span className="text-[#e2e8e4]">
                    {item.depthM == null ? 'Not recorded' : `${item.depthM}m`} /{' '}
                    {item.altitudeM == null ? 'Not recorded' : `${item.altitudeM}m`}
                  </span>
                </div>
                <div className="flex justify-between font-mono text-[10px] text-[#4d5750]">
                  <span>Coords:</span>
                  <span>
                    {item.latitude == null || item.longitude == null
                      ? 'Not geotagged'
                      : `${item.latitude.toFixed(4)}°N, ${item.longitude.toFixed(4)}°E`}
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
                  className="w-full rounded-sm bg-[#3b7b99]/15 border border-[#3b7b99]/30 py-1 font-mono text-[10px] font-bold text-[#3b7b99] hover:bg-[#3b7b99]/25"
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
    return anomalies
      .filter((a) => a.latitude != null && a.longitude != null)
      .map((a, index) => (
        <CircleMarker
          key={`heat-${a.id}-${index}`}
          center={[a.latitude!, a.longitude!]}
          radius={a.severity === 'critical' ? 38 : 22}
          pathOptions={{
            color: a.severity === 'critical' ? '#d93829' : '#d99b26',
            fillColor: a.severity === 'critical' ? '#d93829' : '#d99b26',
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
          color: '#3b7b99',
          fillColor: '#3b7b99',
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
          color: '#5b937c',
          weight: 2,
          opacity: 0.65,
        }}
      />
    ));
  }, [surveys]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#070a0f]">
      {/* Top Floating Telemetry Overlay */}
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
          className="rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018]/95 px-3 py-1.5 font-mono text-xs font-bold text-[#e2e8e4] focus:outline-none"
        >
          <option value="">-- Jump to Survey Zone --</option>
          {Object.entries(MARIS_SURVEY_ZONES).map(([key, val]) => (
            <option key={key} value={key}>
              {val.name}
            </option>
          ))}
        </select>

        {/* Map View Mode Toggles */}
        <div className="flex items-center rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018]/95 p-1 text-xs font-mono">
          <button
            onClick={() => setShowSwaths(!showSwaths)}
            className={clsx(
              'rounded-sm px-2.5 py-1 transition-colors',
              showSwaths ? 'bg-[#3b7b99]/20 text-[#3b7b99] font-bold' : 'text-[#8c978f] hover:text-[#e2e8e4]'
            )}
          >
            Swaths
          </button>
          <button
            onClick={() => setShowTracks(!showTracks)}
            className={clsx(
              'rounded-sm px-2.5 py-1 transition-colors',
              showTracks ? 'bg-[#3b7b99]/20 text-[#3b7b99] font-bold' : 'text-[#8c978f] hover:text-[#e2e8e4]'
            )}
          >
            Tracklines
          </button>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={clsx(
              'flex items-center gap-1 rounded-sm px-2.5 py-1 transition-colors',
              showHeatmap ? 'bg-[#d93829]/20 text-[#d93829] font-bold' : 'text-[#8c978f] hover:text-[#e2e8e4]'
            )}
          >
            ◆ Heatmap
          </button>
          <button
            onClick={() => {
              setMeasureMode(!measureMode);
              setMeasurePoints([]);
            }}
            className={clsx(
              'flex items-center gap-1 rounded-sm px-2.5 py-1 transition-colors',
              measureMode ? 'bg-[#d99b26]/20 text-[#d99b26] font-bold' : 'text-[#8c978f] hover:text-[#e2e8e4]'
            )}
          >
            ╌ Measure
          </button>
        </div>
      </div>

      {/* Realtime Stream Badge in Top Right */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2 rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018]/90 px-3.5 py-1.5">
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#5b937c]"></span>
        </span>
        <span className="font-mono text-xs font-semibold tracking-wider text-[#8c978f]">
          POSTGIS REALTIME ({anomalies.length} TARGETS)
        </span>
      </div>

      {/* Measurement readout toast */}
      {measureMode && (
        <div className="absolute top-16 left-4 z-[1000] rounded-sm border border-[#d99b26]/40 bg-[#101622]/95 p-3 text-xs font-mono text-[#d99b26]">
          <p className="font-bold flex items-center gap-1.5">
            ╌ Acoustic Swath Distance Tool
          </p>
          <p className="text-[11px] text-[#8c978f] mt-1">
            {measurePoints.length === 0 && 'Click anywhere on seabed to place Point 1'}
            {measurePoints.length === 1 && 'Click second location on seabed to compute distance'}
            {measurePoints.length === 2 && (
              <span className="text-[#e2e8e4] font-bold text-sm">
                Distance: {measuredDistanceKm} km ({(Number(measuredDistanceKm) * 1000).toFixed(0)} m)
              </span>
            )}
          </p>
        </div>
      )}

      {/* Main Map Canvas (CARTO Dark Matter) with Hardware Canvas Acceleration */}
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
            attribution="Tiles &copy; Esri - Esri, DeLorme, NAVTEQ"
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
              pathOptions={{ color: '#d99b26', weight: 3, dashArray: '6, 6' }}
            />
          )}

          {/* Target Anomaly Markers */}
          {!showHeatmap && renderedMarkers}
        </MapContainer>
      )}

      {/* Bottom Left Taxonomy Legend */}
      <div className="absolute bottom-6 left-6 z-[1000] rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018]/95 p-3.5">
        <p className="mb-2 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#8c978f]">
          Sonar Hazard Taxonomy
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          {Object.entries(HAZARD_DISPLAY_CONFIG).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: value.color }}
              ></span>
              <span className="text-[#8c978f] text-[11px]">{value.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Right Live Cursor Telemetry Readout */}
      <div className="absolute bottom-6 right-6 z-[1000] rounded-sm border border-[rgba(226,232,228,0.08)] bg-[#0b1018]/95 px-3.5 py-2 font-mono text-xs text-[#8c978f] flex items-center gap-4">
        <div>
          <span className="text-[10px] text-[#4d5750] block">CURSOR COORDINATES</span>
          <span className="text-[#3b7b99] font-bold">
            {cursorPos[0].toFixed(5)}°N, {cursorPos[1].toFixed(5)}°E
          </span>
        </div>
        <div className="border-l border-[rgba(226,232,228,0.08)] pl-3">
          <span className="text-[10px] text-[#4d5750] block">EPSG / DATUM</span>
          <span className="text-[#e2e8e4] font-semibold">4326 (WGS84)</span>
        </div>
      </div>
    </div>
  );
}
