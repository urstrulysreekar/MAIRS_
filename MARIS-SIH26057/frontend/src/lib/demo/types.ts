export type HazardClass =
  | 'ghost_net'
  | 'wreck_debris'
  | 'uxo'
  | 'pipeline'
  | 'biological'
  | 'geological'
  | 'unknown';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'unrated';

export type ReviewStatus =
  | 'new'
  | 'under_review'
  | 'verified'
  | 'cleared'
  | 'dispatched';

export interface Anomaly {
  id: string;
  surveyId: string;
  surveyName: string;
  zone: string;
  hazardClass: HazardClass;
  label: string;
  confidence: number | null;
  latitude: number | null;
  longitude: number | null;
  depthM: number | null;
  altitudeM: number | null;
  lengthM: number | null;
  widthM: number | null;
  areaM2: number | null;
  severity: Severity;
  status: ReviewStatus;
  timestamp: string;
  pingIndex: number;
  snippetSeed: number; // Used for procedural acoustic canvas/SVG generation
  notes?: string;
  assignedTeam?: string;
}

export interface Survey {
  id: string;
  name: string;
  vessel: string;
  zone: string;
  sonarModel: string;
  format: string;
  fileSizeBytes: number | null;
  swathWidthM: number | null;
  frequencyKhz: number | null;
  startDate: string;
  endDate: string;
  status: 'completed' | 'processing' | 'pending' | 'error';
  processingTimeSec: number | null;
  totalPings: number | null;
  areaCoveredKm2: number | null;
  anomalyCount: number;
  centerLat: number | null;
  centerLng: number | null;
  trackLine: [number, number][]; // Array of [lat, lng] points
  swathPolygon: [number, number][]; // Bounding coverage polygon [lat, lng]
}

export interface FilterState {
  searchQuery: string;
  selectedZone: string; // 'all' or zone name
  selectedClass: string; // 'all' or HazardClass
  selectedSeverity: string; // 'all' or Severity
  selectedStatus: string; // 'all' or ReviewStatus
  selectedSurveyId: string; // 'all' or Survey ID
  minConfidence: number; // 0.0 - 1.0
  timeRange: '24h' | '7d' | '30d' | 'all';
}

export interface ProcessingJob {
  id: string;
  surveyName: string;
  vessel: string;
  format: 'XTF' | 'JSF';
  sizeMb: number;
  stage: 'ingest' | 'undroip' | 'mosaicking' | 'detection' | 'geotagging' | 'completed';
  progress: number; // 0 - 100
  startTime: number;
  logs: string[];
  anomaliesFound: number;
}

export interface TacticalAlert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  anomalyId?: string;
  timestamp: string;
  acknowledged: boolean;
  actionRequired: string;
}

export interface KPIMetrics {
  totalSurveys: number;
  surveysDelta7d: number;
  totalAnomalies: number;
  anomaliesDelta7d: number;
  ghostNetsCount: number;
  ghostNetsDelta7d: number;
  activeWorkers: number;
  avgConfidence: number;
  totalAreaCoveredKm2: number;
  sparklines: {
    surveys: number[];
    anomalies: number[];
    ghostNets: number[];
    area: number[];
  };
}
