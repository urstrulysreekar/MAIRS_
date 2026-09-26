"""
/api/v1/infer – Run YOLOv8 inference on a processed sonar session.

Sequence:
  1. Fetch the session from Supabase.
  2. Run the processing pipeline (UNDROIP → SidescanTools → tiling).
  3. Run YOLOv8 on each tile.
  4. Geotag detections using ping-header GPS.
  5. Write anomalies + coordinates + confidence to Supabase.
  6. Update session status to 'completed'.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, BackgroundTasks

from app.core.config import settings
from app.core.supabase_client import get_supabase
from app.services.pipeline import process_log
from app.services.detector import MARISDetector, Detection
from app.services.geotagging import (
    extract_ping_geo_headers,
    bbox_pixel_to_geo,
    is_tank_calibration,
)

logger = logging.getLogger(__name__)
router = APIRouter(tags=["inference"])


def _run_inference_pipeline(session_id: str):
    """Background task: process + detect + geotag + persist."""
    db = get_supabase()

    try:
        # ── 1. Fetch session ──────────────────────────────────
        resp = (
            db.table("sonar_sessions")
            .select("*")
            .eq("id", session_id)
            .single()
            .execute()
        )
        session = resp.data
        if not session:
            logger.error("Session %s not found", session_id)
            return

        # Mark as processing
        db.table("sonar_sessions").update(
            {"status": "processing"}
        ).eq("id", session_id).execute()

        upload_path = session["upload_path"]

        # ── 2. Run pipeline ───────────────────────────────────
        logger.info("[%s] Starting processing pipeline", session_id)
        pipeline_result = process_log(
            session_id=session_id,
            file_path=upload_path,
            output_dir=settings.PROCESSED_DIR,
        )

        # ── 3. Run detector ───────────────────────────────────
        logger.info("[%s] Running YOLOv8 inference", session_id)
        detector = MARISDetector(
            weights_path=settings.YOLO_WEIGHTS_PATH,
            conf_threshold=settings.CONF_THRESHOLD,
            iou_threshold=settings.IOU_THRESHOLD,
            img_size=settings.IMG_SIZE,
        )
        all_detections = detector.predict_batch(pipeline_result.corrected_tiles)

        # ── 4. Geotag & persist ───────────────────────────────
        logger.info("[%s] Geotagging detections", session_id)
        ping_headers = extract_ping_geo_headers(upload_path)
        is_tank = is_tank_calibration(ping_headers)

        for tile_path, detections in all_detections.items():
            for det in detections:
                # Insert anomaly
                anomaly_row = {
                    "session_id": session_id,
                    "class_name": det.class_name,
                    "tile_index": det.tile_index,
                    "ping_start": det.ping_start,
                    "ping_end": det.ping_end,
                    "bbox_x1": det.bbox[0],
                    "bbox_y1": det.bbox[1],
                    "bbox_x2": det.bbox[2],
                    "bbox_y2": det.bbox[3],
                    "image_width": settings.IMG_SIZE,
                    "image_height": settings.IMG_SIZE,
                }
                anom_resp = (
                    db.table("anomalies")
                    .insert(anomaly_row)
                    .execute()
                )
                anomaly_id = anom_resp.data[0]["id"]

                # Insert confidence
                db.table("anomaly_confidence").insert({
                    "anomaly_id": anomaly_id,
                    "class_name": det.class_name,
                    "confidence": det.confidence,
                }).execute()

                # Insert coordinates (skip for tank calibrations)
                if not is_tank and ping_headers:
                    try:
                        geo = bbox_pixel_to_geo(
                            bbox=det.bbox,
                            image_width=settings.IMG_SIZE,
                            image_height=settings.IMG_SIZE,
                            ping_headers=ping_headers,
                            ping_start=det.ping_start or 0,
                            ping_end=det.ping_end or len(ping_headers),
                        )
                        db.table("anomaly_coordinates").insert({
                            "anomaly_id": anomaly_id,
                            "latitude": geo.latitude,
                            "longitude": geo.longitude,
                            "depth_m": geo.depth_m,
                            "altitude_m": geo.altitude_m,
                            "source": "ping_header",
                        }).execute()
                    except NotImplementedError:
                        logger.warning(
                            "Skipping geotag for anomaly %s – no real ping headers",
                            anomaly_id,
                        )

        # ── 5. Mark completed ─────────────────────────────────
        update_data = {
            "status": "completed",
            "processed_path": str(pipeline_result.corrected_tiles[0]) if pipeline_result.corrected_tiles else None,
            "ping_count": pipeline_result.ping_count,
            "swath_width_m": pipeline_result.swath_width_m,
        }
        db.table("sonar_sessions").update(update_data).eq("id", session_id).execute()
        logger.info("[%s] Inference pipeline completed", session_id)

    except NotImplementedError as exc:
        logger.warning("[%s] Pipeline not yet implemented: %s", session_id, exc)
        db.table("sonar_sessions").update({
            "status": "error",
            "error_message": f"Not yet implemented: {exc}",
        }).eq("id", session_id).execute()

    except Exception as exc:
        logger.exception("[%s] Inference pipeline failed", session_id)
        db.table("sonar_sessions").update({
            "status": "error",
            "error_message": str(exc),
        }).eq("id", session_id).execute()


@router.post("/infer/{session_id}")
async def run_inference(session_id: str, background_tasks: BackgroundTasks):
    """Queue inference for a sonar session.

    This is non-blocking: the pipeline runs in a background task.
    Poll GET /api/v1/reports/{session_id} or use Supabase realtime
    to track status.
    """
    db = get_supabase()
    resp = (
        db.table("sonar_sessions")
        .select("id, status")
        .eq("id", session_id)
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=404, detail="Session not found.")

    session = resp.data[0]
    if session["status"] == "processing":
        raise HTTPException(status_code=409, detail="Session is already processing.")

    background_tasks.add_task(_run_inference_pipeline, session_id)

    return {
        "session_id": session_id,
        "status": "processing",
        "message": "Inference pipeline queued. Use Supabase realtime or poll /reports to track.",
    }
