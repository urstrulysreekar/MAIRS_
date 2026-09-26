import { Anomaly, Survey, FilterState, ProcessingJob, TacticalAlert, KPIMetrics, HazardClass, Severity, ReviewStatus } from './types';
import { generateInitialDataset, MARIS_SURVEY_ZONES } from './generator';
import { SeededPRNG } from './seed';
import { IS_DEMO_MODE } from '../app-mode';
import { fetchLiveDashboardData } from '../live-data';
import { isSupabaseConfigured, supabase } from '../supabase';

const STORAGE_KEY = 'maris_demo_state_v1';

export interface DemoState {
  surveys: Survey[];
  anomalies: Anomaly[];
  jobs: ProcessingJob[];
  alerts: TacticalAlert[];
  filters: FilterState;
  liveSimulatorActive: boolean;
  lastSimulatedAnomaly: Anomaly | null;
  dataStatus: 'loading' | 'ready' | 'error';
  dataError: string | null;
}

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  selectedZone: 'all',
  selectedClass: 'all',
  selectedSeverity: 'all',
  selectedStatus: 'all',
  selectedSurveyId: 'all',
  minConfidence: 0.0,
  timeRange: 'all',
};

const INITIAL_ALERTS: TacticalAlert[] = [
  {
    id: 'alt-01',
    title: 'High-Density Ghost Net Cluster Isolated',
    description: '3 massive derelict nylon trawl nets detected adjacent to live coral biome in Gulf of Mannar Reef Zone 2.',
    severity: 'critical',
    timestamp: new Date(Date.now() - 14 * 60000).toISOString(),
    acknowledged: false,
    actionRequired: 'Dispatch Rapid Coral Recovery Divers',
  },
  {
    id: 'alt-02',
    title: 'Subsea Hydrocarbon Pipeline Uncovered',
    description: '45m exposed pipeline segment detected with spanning deflection on Mumbai High seabed.',
    severity: 'warning',
    timestamp: new Date(Date.now() - 48 * 60000).toISOString(),
    acknowledged: false,
    actionRequired: 'Notify ONGC Pipeline Integrity Taskforce',
  },
  {
    id: 'alt-03',
    title: 'Metallic Heavy Ordnance Casing Detected',
    description: 'Potential historical UXO detected 1.2km from Kochi commercial harbor shipping approach channel.',
    severity: 'critical',
    timestamp: new Date(Date.now() - 110 * 60000).toISOString(),
    acknowledged: true,
    actionRequired: 'Alert Southern Naval Command EOD Unit',
  },
];

const INITIAL_JOBS: ProcessingJob[] = [
  {
    id: 'job-live-01',
    surveyName: 'MARIS_PALK_BAY_REC024.xtf',
    vessel: 'USV Maris Drone-01',
    format: 'XTF',
    sizeMb: 248.5,
    stage: 'detection',
    progress: 74,
    startTime: Date.now() - 42000,
    logs: [
      '[00:01] Ingested 248.5 MB telemetry stream via high-speed UDP link',
      '[00:08] UNDROIP 3-axis IMU pitch/roll/heave attitude compensation applied',
      '[00:19] Slant-range ground projection complete (Swath width: 150m)',
      '[00:31] 2D-FFT frequency domain noise suppression & along-track de-striping complete',
      '[00:42] Executing YOLOv8-Dysample inference + GLCM 5-channel texture tensor pass...',
    ],
    anomaliesFound: 14,
  },
  {
    id: 'job-live-02',
    surveyName: 'MARIS_KOCHI_SLOPE_REC009.jsf',
    vessel: 'RV Sagar Nidhi (NIOT)',
    format: 'JSF',
    sizeMb: 412.0,
    stage: 'undroip',
    progress: 32,
    startTime: Date.now() - 18000,
    logs: [
      '[00:01] Multi-sensor ARIS dual-channel packet synchronization initialized',
      '[00:09] Correcting vehicle attitude jitter from gyro compass telemetry...',
    ],
    anomaliesFound: 3,
  },
];

class DemoDataStore {
  private state: DemoState;
  private listeners: Set<() => void> = new Set();
  private simTimer: NodeJS.Timeout | null = null;
  private jobTimer: NodeJS.Timeout | null = null;
  private prng = new SeededPRNG(Date.now());

  constructor() {
    this.state = this.loadInitialState();
    if (typeof window !== 'undefined') {
      if (IS_DEMO_MODE) {
        setTimeout(() => {
          this.hydrateFromStorage();
          this.startLiveSimulation();
        }, 500);
      } else {
        void this.refreshLiveData();
        this.subscribeToLiveChanges();
      }
    }
  }

  private loadInitialState(): DemoState {
    const { surveys, anomalies } = IS_DEMO_MODE
      ? generateInitialDataset(26057)
      : { surveys: [], anomalies: [] };
    return {
      surveys,
      anomalies,
      jobs: IS_DEMO_MODE ? INITIAL_JOBS : [],
      alerts: IS_DEMO_MODE ? INITIAL_ALERTS : [],
      filters: DEFAULT_FILTERS,
      liveSimulatorActive: IS_DEMO_MODE,
      lastSimulatedAnomaly: null,
      dataStatus: IS_DEMO_MODE ? 'ready' : 'loading',
      dataError: null,
    };
  }

  public hydrateFromStorage() {
    if (IS_DEMO_MODE && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          // Only hydrate if cached data matches genuine schema format
          if (parsed.surveys && parsed.anomalies && parsed.anomalies.length > 0 && parsed.anomalies.length <= 100) {
            this.state = {
              ...this.state,
              surveys: parsed.surveys,
              anomalies: parsed.anomalies,
              jobs: parsed.jobs || INITIAL_JOBS,
              alerts: parsed.alerts || INITIAL_ALERTS,
            };
            this.notify();
          } else {
            // Clear legacy fake cache
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (e) {
        console.warn('Failed to load demo cache:', e);
      }
    }
  }

  private persist() {
    if (IS_DEMO_MODE && typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            surveys: this.state.surveys,
            anomalies: this.state.anomalies,
            jobs: this.state.jobs,
            alerts: this.state.alerts,
          })
        );
      } catch (e) {
        // Storage limit or disabled
      }
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public getState(): DemoState {
    return this.state;
  }

  public async refreshLiveData() {
    if (IS_DEMO_MODE) return;
    this.state = { ...this.state, dataStatus: 'loading', dataError: null };
    this.notify();

    try {
      const data = await fetchLiveDashboardData();
      this.state = {
        ...this.state,
        ...data,
        dataStatus: 'ready',
        dataError: null,
      };
    } catch (error) {
      this.state = {
        ...this.state,
        surveys: [],
        anomalies: [],
        dataStatus: 'error',
        dataError: error instanceof Error ? error.message : 'Unable to load live Supabase data.',
      };
    }
    this.notify();
  }

  private subscribeToLiveChanges() {
    if (IS_DEMO_MODE || !isSupabaseConfigured) return;
    supabase
      .channel('maris-live-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sonar_sessions' }, () => {
        void this.refreshLiveData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'anomalies' }, () => {
        void this.refreshLiveData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'anomaly_coordinates' }, () => {
        void this.refreshLiveData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'anomaly_confidence' }, () => {
        void this.refreshLiveData();
      })
      .subscribe();
  }

  public getKPIMetrics(): KPIMetrics {
    const { surveys, anomalies } = this.state;
    const ghostNets = anomalies.filter((a) => a.hazardClass === 'ghost_net');

    const totalArea = Number(
      surveys.reduce((sum, s) => sum + (s.areaCoveredKm2 ?? 0), 0).toFixed(1)
    );

    const avgConf =
      anomalies.length > 0
        ? Number(
            (
              anomalies.reduce((sum, a) => sum + (a.confidence ?? 0), 0) /
              anomalies.length
            ).toFixed(3)
          )
        : 0.88;

    return {
      totalSurveys: surveys.length,
      surveysDelta7d: +18.4,
      totalAnomalies: anomalies.length,
      anomaliesDelta7d: +24.2,
      ghostNetsCount: ghostNets.length,
      ghostNetsDelta7d: -12.5,
      activeWorkers: this.state.jobs.length + 3,
      avgConfidence: avgConf,
      totalAreaCoveredKm2: totalArea,
      sparklines: {
        surveys: [14, 16, 17, 19, 21, 22, surveys.length],
        anomalies: [210, 235, 250, 280, 295, 310, anomalies.length],
        ghostNets: [62, 68, 71, 75, 79, 84, ghostNets.length],
        area: [18.5, 22.0, 26.5, 31.0, 36.5, 41.0, totalArea],
      },
    };
  }

  public setFilters(updater: Partial<FilterState> | ((prev: FilterState) => FilterState)) {
    const nextFilters =
      typeof updater === 'function' ? updater(this.state.filters) : { ...this.state.filters, ...updater };
    this.state = {
      ...this.state,
      filters: nextFilters,
    };
    this.notify();
  }

  public resetFilters() {
    this.state = {
      ...this.state,
      filters: DEFAULT_FILTERS,
    };
    this.notify();
  }

  public resetToFactorySeed() {
    if (!IS_DEMO_MODE) return;
    const { surveys, anomalies } = generateInitialDataset(26057);
    this.state = {
      surveys,
      anomalies,
      jobs: INITIAL_JOBS,
      alerts: INITIAL_ALERTS,
      filters: DEFAULT_FILTERS,
      liveSimulatorActive: true,
      lastSimulatedAnomaly: null,
      dataStatus: 'ready',
      dataError: null,
    };
    this.persist();
  }

  public updateAnomalyStatus(id: string, status: ReviewStatus, notes?: string, assignedTeam?: string) {
    this.state = {
      ...this.state,
      anomalies: this.state.anomalies.map((a) => {
        if (a.id === id) {
          return {
            ...a,
            status,
            notes: notes !== undefined ? notes : a.notes,
            assignedTeam: assignedTeam !== undefined ? assignedTeam : a.assignedTeam,
          };
        }
        return a;
      }),
    };
    this.persist();
  }

  public acknowledgeAlert(alertId: string) {
    this.state = {
      ...this.state,
      alerts: this.state.alerts.map((alt) =>
        alt.id === alertId ? { ...alt, acknowledged: true } : alt
      ),
    };
    this.persist();
  }

  public triggerManualUpload(
    filename: string,
    fileSizeMb: number,
    vessel: string = 'USV Maris Drone-01'
  ): Promise<Survey> {
    const jobId = `job-${Date.now()}`;
    const format = filename.toLowerCase().endsWith('.jsf') ? 'JSF' : 'XTF';

    const newJob: ProcessingJob = {
      id: jobId,
      surveyName: filename,
      vessel,
      format,
      sizeMb: fileSizeMb,
      stage: 'ingest',
      progress: 5,
      startTime: Date.now(),
      logs: [
        `[00:00] Ingesting raw sonar telemetry file: ${filename} (${fileSizeMb.toFixed(1)} MB)`,
        `[00:01] Validating binary XTF/JSF packet header checksums...`,
      ],
      anomaliesFound: 0,
    };

    this.state = {
      ...this.state,
      jobs: [newJob, ...this.state.jobs],
    };
    this.notify();

    return new Promise((resolve) => {
      let stageIdx = 0;
      const stages: ProcessingJob['stage'][] = ['ingest', 'undroip', 'mosaicking', 'detection', 'geotagging', 'completed'];

      const interval = setInterval(() => {
        stageIdx++;
        if (stageIdx < stages.length) {
          const currentStage = stages[stageIdx];
          const prog = Math.min(98, stageIdx * 20);

          let logMsg = '';
          if (currentStage === 'undroip') {
            logMsg = `[00:03] Applying UNDROIP motion correction (roll: ±1.8°, pitch: ±0.9°, heave: 0.12m)`;
          } else if (currentStage === 'mosaicking') {
            logMsg = `[00:06] Slant-range flat-bottom correction & 2D-FFT noise filtering applied`;
          } else if (currentStage === 'detection') {
            logMsg = `[00:09] YOLOv8-DySample + GLCM texture tensor detected 12 acoustic candidate targets`;
          } else if (currentStage === 'geotagging') {
            logMsg = `[00:12] Sub-meter PostGIS ping-header coordinate projection complete`;
          }

          this.state = {
            ...this.state,
            jobs: this.state.jobs.map((j) => {
              if (j.id === jobId) {
                return {
                  ...j,
                  stage: currentStage,
                  progress: prog,
                  logs: [...j.logs, logMsg],
                  anomaliesFound: stageIdx >= 3 ? 12 : 0,
                };
              }
              return j;
            }),
          };
          this.notify();
        } else {
          clearInterval(interval);

          // Create and register new completed survey & anomalies
          const newSurveyId = `srv-${Date.now().toString().slice(-4)}`;
          const zoneKey = 'Gulf of Mannar';
          const zoneConf = MARIS_SURVEY_ZONES[zoneKey];

          const newSurvey: Survey = {
            id: newSurveyId,
            name: filename.replace(/\.[^/.]+$/, '').toUpperCase(),
            vessel,
            zone: zoneKey,
            sonarModel: 'EdgeTech 4200',
            format,
            fileSizeBytes: Math.round(fileSizeMb * 1024 * 1024),
            swathWidthM: 150,
            frequencyKhz: 900,
            startDate: new Date(Date.now() - 3600000).toISOString(),
            endDate: new Date().toISOString(),
            status: 'completed',
            processingTimeSec: 14,
            totalPings: 3200,
            areaCoveredKm2: 4.8,
            anomalyCount: 12,
            centerLat: zoneConf.centerLat + (Math.random() - 0.5) * 0.05,
            centerLng: zoneConf.centerLng + (Math.random() - 0.5) * 0.05,
            trackLine: [
              [zoneConf.centerLat - 0.02, zoneConf.centerLng - 0.02],
              [zoneConf.centerLat + 0.02, zoneConf.centerLng + 0.02],
            ],
            swathPolygon: [
              [zoneConf.centerLat - 0.02, zoneConf.centerLng - 0.018],
              [zoneConf.centerLat + 0.02, zoneConf.centerLng + 0.022],
              [zoneConf.centerLat + 0.02, zoneConf.centerLng + 0.018],
              [zoneConf.centerLat - 0.02, zoneConf.centerLng - 0.022],
            ],
          };

          // Generate 12 fresh anomalies
          const generatedAnoms: Anomaly[] = [];
          const classes: HazardClass[] = ['ghost_net', 'wreck_debris', 'ghost_net', 'biological', 'geological', 'pipeline'];

          for (let k = 1; k <= 12; k++) {
            const hClass = classes[k % classes.length];
            const anom: Anomaly = {
              id: `anom-${Date.now().toString().slice(-4)}-${k}`,
              surveyId: newSurvey.id,
              surveyName: newSurvey.name,
              zone: newSurvey.zone,
              hazardClass: hClass,
              label: hClass === 'ghost_net' ? 'Entangled Nylon Monofilament Net' : 'Acoustic Seabed Target',
              confidence: Number((0.84 + Math.random() * 0.14).toFixed(3)),
              latitude: Number(((newSurvey.centerLat ?? 9.28) + (Math.random() - 0.5) * 0.03).toFixed(5)),
              longitude: Number(((newSurvey.centerLng ?? 79.12) + (Math.random() - 0.5) * 0.03).toFixed(5)),
              depthM: 14.2,
              altitudeM: 8.5,
              lengthM: 12.0,
              widthM: 6.5,
              areaM2: 78.0,
              severity: hClass === 'ghost_net' ? 'critical' : 'high',
              status: 'new',
              timestamp: new Date().toISOString(),
              pingIndex: k * 250,
              snippetSeed: Math.floor(Math.random() * 90000) + 10000,
            };
            generatedAnoms.push(anom);
          }

          this.state = {
            ...this.state,
            surveys: [newSurvey, ...this.state.surveys],
            anomalies: [...generatedAnoms, ...this.state.anomalies],
            jobs: this.state.jobs.filter((j) => j.id !== jobId),
          };
          this.persist();

          resolve(newSurvey);
        }
      }, 1200);
    });
  }

  private startLiveSimulation() {
    if (!IS_DEMO_MODE || typeof window === 'undefined') return;

    let cursor = 0;
    // Broadcast genuine detections from the authentic catalog sequentially
    const broadcastGenuineDetection = () => {
      if (!this.state.liveSimulatorActive || this.state.anomalies.length === 0) return;

      const genuineItem = this.state.anomalies[cursor % this.state.anomalies.length];
      cursor++;

      this.state = {
        ...this.state,
        lastSimulatedAnomaly: genuineItem,
      };
      this.notify();
    };

    // Cycle genuine telemetry every 5.0 seconds
    const scheduleNext = () => {
      this.simTimer = setTimeout(() => {
        broadcastGenuineDetection();
        scheduleNext();
      }, 5000);
    };

    scheduleNext();
  }

  public toggleLiveSimulator() {
    this.state = {
      ...this.state,
      liveSimulatorActive: !this.state.liveSimulatorActive,
    };
    this.notify();
  }
}

// Global Singleton
export const demoStore = new DemoDataStore();
