"""
/api/v1/reports – Structured data export.

Serves anomaly detection results as JSON or CSV.
Designed to feed the existing FOSS report.py module and
the Next.js frontend dashboard.
"""

from __future__ import annotations

import csv
import io
import logging

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse

from app.core.supabase_client import get_supabase

logger = logging.getLogger(__name__)
router = APIRouter(tags=["reports"])


def _fetch_session_report(session_id: str) -> dict:
    """Fetch a complete report payload for one session."""
    db = get_supabase()

    # Session metadata
    sess_resp = (
        db.table("sonar_sessions")
        .select("*")
        .eq("id", session_id)
        .single()
        .execute()
    )
    if not sess_resp.data:
        raise HTTPException(status_code=404, detail="Session not found.")

    session = sess_resp.data

    # Anomalies with coordinates and confidence
    anom_resp = (
        db.table("anomalies")
        .select(
            "*, "
            "anomaly_coordinates(*), "
            "anomaly_confidence(*)"
        )
        .eq("session_id", session_id)
        .order("created_at")
        .execute()
    )

    return {
        "session": session,
        "anomalies": anom_resp.data or [],
        "total_detections": len(anom_resp.data or []),
    }


def _report_to_geojson(report: dict) -> dict:
    """Convert a report to GeoJSON FeatureCollection."""
    features = []
    for anom in report["anomalies"]:
        coords = anom.get("anomaly_coordinates")
        if not coords:
            continue
        # anomaly_coordinates is a list (from the join) or single object
        if isinstance(coords, list):
            coords = coords[0] if coords else None
        if not coords:
            continue

        conf_entries = anom.get("anomaly_confidence", [])
        top_conf = max(
            (c["confidence"] for c in conf_entries),
            default=0.0,
        ) if conf_entries else 0.0

        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [coords["longitude"], coords["latitude"]],
            },
            "properties": {
                "anomaly_id": anom["id"],
                "class_name": anom["class_name"],
                "confidence": top_conf,
                "review_status": anom.get("review_status", "unreviewed"),
                "depth_m": coords.get("depth_m"),
                "bbox": [anom["bbox_x1"], anom["bbox_y1"], anom["bbox_x2"], anom["bbox_y2"]],
            },
        })

    return {
        "type": "FeatureCollection",
        "features": features,
        "properties": {
            "session_id": report["session"]["id"],
            "filename": report["session"]["filename"],
            "total_detections": report["total_detections"],
        },
    }


def _report_to_csv(report: dict) -> str:
    """Convert a report to CSV string."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "anomaly_id", "class_name", "confidence", "review_status",
        "latitude", "longitude", "depth_m",
        "bbox_x1", "bbox_y1", "bbox_x2", "bbox_y2",
    ])

    for anom in report["anomalies"]:
        coords = anom.get("anomaly_coordinates")
        if isinstance(coords, list):
            coords = coords[0] if coords else {}
        coords = coords or {}

        conf_entries = anom.get("anomaly_confidence", [])
        top_conf = max(
            (c["confidence"] for c in conf_entries),
            default=0.0,
        ) if conf_entries else 0.0

        writer.writerow([
            anom["id"],
            anom["class_name"],
            f"{top_conf:.4f}",
            anom.get("review_status", "unreviewed"),
            coords.get("latitude", ""),
            coords.get("longitude", ""),
            coords.get("depth_m", ""),
            anom["bbox_x1"], anom["bbox_y1"],
            anom["bbox_x2"], anom["bbox_y2"],
        ])

    return output.getvalue()


@router.get("/reports/{session_id}")
async def get_report(
    session_id: str,
    fmt: str = Query("json", regex="^(json|geojson|csv)$"),
):
    """Export detection results for a session.

    Query params:
        fmt: 'json' (full payload), 'geojson' (GeoJSON FeatureCollection),
             or 'csv' (flat table).
    """
    report = _fetch_session_report(session_id)

    if fmt == "geojson":
        return _report_to_geojson(report)

    if fmt == "csv":
        csv_str = _report_to_csv(report)
        return StreamingResponse(
            io.StringIO(csv_str),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=maris_{session_id}.csv"
            },
        )

    # Default: full JSON
    return report
