import { supabase, isSupabaseConfigured } from './supabase';
import { Anomaly, HazardClass, ReviewStatus, Severity, Survey } from './demo/types';

export interface LiveDashboardData {
  surveys: Survey[];
  anomalies: Anomaly[];
}

const knownHazards: HazardClass[] = [
  'ghost_net',
  'wreck_debris',
  'uxo',
  'pipeline',
  'biological',
  'geological',
];

function relationRows(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value as Record<string, unknown>[];
  return value && typeof value === 'object' ? [value as Record<string, unknown>] : [];
}

function mapReviewStatus(status: string): ReviewStatus {
  if (status === 'confirmed') return 'verified';
  if (status === 'rejected') return 'cleared';
  if (status === 'deferred') return 'under_review';
  return 'new';
}

function sessionStatus(status: string): Survey['status'] {
  if (status === 'completed' || status === 'processing' || status === 'error') return status;
  return 'pending';
}

export async function fetchLiveDashboardData(): Promise<LiveDashboardData> {
  if (!isSupabaseConfigured) {
    throw new Error('Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in frontend/.env.local.');
  }

  const [sessionsResponse, anomaliesResponse] = await Promise.all([
    supabase.from('sonar_sessions').select('*').order('created_at', { ascending: false }),
    supabase
      .from('anomalies')
      .select('*, anomaly_coordinates(*), anomaly_confidence(*)')
      .order('created_at', { ascending: false }),
  ]);

  if (sessionsResponse.error) throw sessionsResponse.error;
  if (anomaliesResponse.error) throw anomaliesResponse.error;

  const sessions = sessionsResponse.data ?? [];
  const detections = anomaliesResponse.data ?? [];
  const sessionById = new Map(sessions.map((session) => [session.id, session]));
  const anomalies: Anomaly[] = detections.map((row) => {
    const session = sessionById.get(row.session_id);
    const coordinates = relationRows(row.anomaly_coordinates)[0];
    const confidenceRows = relationRows(row.anomaly_confidence);
    const confidence = confidenceRows.reduce<number | null>((maximum, item) => {
      const value = Number(item.human_override ?? item.confidence);
      return Number.isFinite(value) ? Math.max(maximum ?? 0, value) : maximum;
    }, null);
    const rawClass = String(row.class_name);
    const hazardClass = knownHazards.includes(rawClass as HazardClass)
      ? (rawClass as HazardClass)
      : 'unknown';

    return {
      id: String(row.id),
      surveyId: String(row.session_id),
      surveyName: String(session?.filename ?? 'Unknown survey'),
      zone: String(session?.metadata?.zone ?? 'Not recorded'),
      hazardClass,
      label: String(row.label || rawClass.replaceAll('_', ' ')),
      confidence,
      latitude: coordinates ? Number(coordinates.latitude) : null,
      longitude: coordinates ? Number(coordinates.longitude) : null,
      depthM: coordinates?.depth_m == null ? null : Number(coordinates.depth_m),
      altitudeM: coordinates?.altitude_m == null ? null : Number(coordinates.altitude_m),
      lengthM: null,
      widthM: null,
      areaM2: null,
      severity: 'unrated' as Severity,
      status: mapReviewStatus(String(row.review_status)),
      timestamp: String(row.created_at),
      pingIndex: Number(row.ping_start ?? 0),
      snippetSeed: Array.from(String(row.id)).reduce((seed, char) => seed + char.charCodeAt(0), 0),
      notes: row.reviewer_notes ?? undefined,
    };
  });

  const surveyAnomalyCounts = new Map<string, number>();
  const coordinatesBySession = new Map<string, [number, number][]>();
  for (const anomaly of anomalies) {
    surveyAnomalyCounts.set(anomaly.surveyId, (surveyAnomalyCounts.get(anomaly.surveyId) ?? 0) + 1);
    if (anomaly.latitude != null && anomaly.longitude != null) {
      const points = coordinatesBySession.get(anomaly.surveyId) ?? [];
      points.push([anomaly.latitude, anomaly.longitude]);
      coordinatesBySession.set(anomaly.surveyId, points);
    }
  }

  const surveys: Survey[] = sessions.map((session) => {
    const points = coordinatesBySession.get(session.id) ?? [];
    const center = points.length
      ? points.reduce<[number, number]>((sum, point) => [sum[0] + point[0], sum[1] + point[1]], [0, 0])
      : null;

    return {
      id: String(session.id),
      name: String(session.filename),
      vessel: String(session.metadata?.vessel ?? 'Not recorded'),
      zone: String(session.metadata?.zone ?? 'Not recorded'),
      sonarModel: String(session.sensor_type ?? 'Not recorded'),
      format: String(session.file_format ?? 'Not recorded'),
      fileSizeBytes: session.file_size_bytes == null ? null : Number(session.file_size_bytes),
      swathWidthM: session.swath_width_m == null ? null : Number(session.swath_width_m),
      frequencyKhz: null,
      startDate: String(session.created_at),
      endDate: String(session.updated_at ?? session.created_at),
      status: sessionStatus(String(session.status)),
      processingTimeSec: null,
      totalPings: session.ping_count == null ? null : Number(session.ping_count),
      areaCoveredKm2: null,
      anomalyCount: surveyAnomalyCounts.get(String(session.id)) ?? 0,
      centerLat: center ? center[0] / points.length : null,
      centerLng: center ? center[1] / points.length : null,
      trackLine: [],
      swathPolygon: [],
    };
  });

  return { surveys, anomalies };
}