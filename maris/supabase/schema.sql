-- ============================================================
-- MARIS – Supabase Schema  (SIH26057)
-- Marine Anomaly Recognition and Intelligence System
-- ============================================================
-- Deploy: paste into Supabase SQL Editor  ▸  Run
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ── ENUM-LIKE DOMAIN TYPES ───────────────────────────────────
-- We use CHECK constraints instead of CREATE TYPE so Supabase
-- migrations stay idempotent on re-run.

-- ── 1. sonar_sessions ────────────────────────────────────────
-- One row per uploaded XTF / JSF sonar log file.
CREATE TABLE IF NOT EXISTS sonar_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename        TEXT NOT NULL,
    sensor_type     TEXT NOT NULL
                    CHECK (sensor_type IN ('ARIS','SSS','MBES','UNKNOWN')),
    file_format     TEXT NOT NULL
                    CHECK (file_format IN ('XTF','JSF','S7K','OTHER')),
    file_size_bytes BIGINT,
    crs_epsg        INTEGER DEFAULT 4326,
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','processing','completed','error')),
    error_message   TEXT,
    upload_path     TEXT,
    processed_path  TEXT,
    ping_count      INTEGER,
    swath_width_m   REAL,
    metadata        JSONB DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  sonar_sessions IS 'Each uploaded sonar survey file.';
COMMENT ON COLUMN sonar_sessions.crs_epsg IS 'EPSG code; 4326=WGS84, 0=tank/no-GPS.';
COMMENT ON COLUMN sonar_sessions.status IS 'pending → processing → completed | error';

-- ── 2. anomalies ─────────────────────────────────────────────
-- Each bounding-box detection from YOLOv8 inference.
CREATE TABLE IF NOT EXISTS anomalies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID NOT NULL REFERENCES sonar_sessions(id) ON DELETE CASCADE,
    class_name      TEXT NOT NULL
                    CHECK (class_name IN (
                        'ghost_net','wreck_debris','uxo','pipeline',
                        'geological','biological','unknown'
                    )),
    label           TEXT,
    tile_index      INTEGER,
    ping_start      INTEGER,
    ping_end        INTEGER,
    bbox_x1         REAL NOT NULL,
    bbox_y1         REAL NOT NULL,
    bbox_x2         REAL NOT NULL,
    bbox_y2         REAL NOT NULL,
    bbox_area_px    REAL GENERATED ALWAYS AS (
                        ABS(bbox_x2 - bbox_x1) * ABS(bbox_y2 - bbox_y1)
                    ) STORED,
    image_width     INTEGER,
    image_height    INTEGER,
    review_status   TEXT NOT NULL DEFAULT 'unreviewed'
                    CHECK (review_status IN ('unreviewed','confirmed','rejected','deferred')),
    reviewer_notes  TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  anomalies IS 'YOLOv8 detections with bounding boxes.';
COMMENT ON COLUMN anomalies.class_name IS 'Hazard taxonomy aligned with AI4Shipwrecks labels.';
COMMENT ON COLUMN anomalies.review_status IS 'Human-in-the-loop verification state.';

-- ── 3. anomaly_coordinates ───────────────────────────────────
-- Geo-referenced position derived from ping-header GPS + pixel offset.
CREATE TABLE IF NOT EXISTS anomaly_coordinates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anomaly_id      UUID NOT NULL UNIQUE
                    REFERENCES anomalies(id) ON DELETE CASCADE,
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    depth_m         REAL,
    altitude_m      REAL,
    crs_epsg        INTEGER NOT NULL DEFAULT 4326,
    geom            GEOMETRY(Point, 4326),
    source          TEXT NOT NULL DEFAULT 'ping_header'
                    CHECK (source IN ('ping_header','manual','interpolated')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE anomaly_coordinates IS 'PostGIS-backed geolocations for each detection.';

-- Auto-populate PostGIS geometry on insert / update
CREATE OR REPLACE FUNCTION set_anomaly_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_anomaly_geom ON anomaly_coordinates;
CREATE TRIGGER trg_set_anomaly_geom
    BEFORE INSERT OR UPDATE ON anomaly_coordinates
    FOR EACH ROW
    EXECUTE FUNCTION set_anomaly_geom();

-- ── 4. anomaly_confidence ────────────────────────────────────
-- Per-class confidence from model + optional human override.
CREATE TABLE IF NOT EXISTS anomaly_confidence (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anomaly_id      UUID NOT NULL
                    REFERENCES anomalies(id) ON DELETE CASCADE,
    model_name      TEXT NOT NULL DEFAULT 'yolov8n-maris',
    class_name      TEXT NOT NULL,
    confidence      REAL NOT NULL
                    CHECK (confidence >= 0.0 AND confidence <= 1.0),
    human_override  REAL
                    CHECK (human_override IS NULL
                           OR (human_override >= 0.0 AND human_override <= 1.0)),
    override_reason TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN anomaly_confidence.confidence IS 'Raw YOLOv8 score 0.0-1.0.';
COMMENT ON COLUMN anomaly_confidence.human_override IS 'Analyst override; NULL = not reviewed.';

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_anomalies_session   ON anomalies(session_id);
CREATE INDEX IF NOT EXISTS idx_anomalies_class     ON anomalies(class_name);
CREATE INDEX IF NOT EXISTS idx_anomalies_review    ON anomalies(review_status);
CREATE INDEX IF NOT EXISTS idx_coords_geom         ON anomaly_coordinates USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_confidence_anomaly  ON anomaly_confidence(anomaly_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status     ON sonar_sessions(status);

-- ── Row-Level Security (permissive for hackathon) ────────────
ALTER TABLE sonar_sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomalies           ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_coordinates ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_confidence  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_sonar_sessions"      ON sonar_sessions      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_anomalies"           ON anomalies           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_anomaly_coordinates" ON anomaly_coordinates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_anomaly_confidence"  ON anomaly_confidence  FOR ALL USING (true) WITH CHECK (true);

-- ── Realtime ─────────────────────────────────────────────────
-- Enable Supabase Realtime so the frontend can subscribe.
ALTER PUBLICATION supabase_realtime ADD TABLE anomalies;
ALTER PUBLICATION supabase_realtime ADD TABLE anomaly_coordinates;
ALTER PUBLICATION supabase_realtime ADD TABLE sonar_sessions;

-- ── Auto-touch updated_at ────────────────────────────────────
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sessions_updated ON sonar_sessions;
CREATE TRIGGER trg_sessions_updated
    BEFORE UPDATE ON sonar_sessions
    FOR EACH ROW
    EXECUTE FUNCTION touch_updated_at();
