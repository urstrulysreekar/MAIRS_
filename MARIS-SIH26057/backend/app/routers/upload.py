"""
/api/v1/upload – Sonar file ingestion.

Accepts raw XTF / JSF sonar logs:
  1. Validates extension & size.
  2. Saves to disk under UPLOAD_DIR.
  3. Creates a sonar_sessions row in Supabase (status='pending').
  4. Returns the session_id for downstream pipeline & inference calls.

Background processing (UNDROIP → SidescanTools) is triggered by
the caller POSTing to /api/v1/infer/{session_id} after upload.
"""

from __future__ import annotations

import uuid
import logging
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException
import aiofiles

from app.core.config import settings
from app.core.supabase_client import get_supabase

logger = logging.getLogger(__name__)
router = APIRouter(tags=["upload"])

# Allowed extensions
_ALLOWED_EXTENSIONS = {".xtf", ".jsf", ".s7k"}
# 500 MB upload limit
_MAX_SIZE_BYTES = 500 * 1024 * 1024


@router.post("/upload")
async def upload_sonar_file(file: UploadFile = File(...)):
    """Receive a sonar log file and register a new session.

    Returns:
        {"session_id": "...", "filename": "...", "status": "pending"}
    """
    # ── 1. Validate extension ─────────────────────────────────
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    ext = Path(file.filename).suffix.lower()
    if ext not in _ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported format '{ext}'. Accepted: {_ALLOWED_EXTENSIONS}",
        )

    # ── 2. Read & validate size ───────────────────────────────
    content = await file.read()
    if len(content) > _MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds {_MAX_SIZE_BYTES // (1024*1024)} MB limit.",
        )

    # ── 3. Save to disk ───────────────────────────────────────
    session_id = str(uuid.uuid4())
    session_dir = Path(settings.UPLOAD_DIR) / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    save_path = session_dir / file.filename

    async with aiofiles.open(save_path, "wb") as f:
        await f.write(content)

    logger.info(
        "Saved %s (%d bytes) → %s",
        file.filename, len(content), save_path,
    )

    # ── 4. Determine sensor type from extension ───────────────
    format_map = {".xtf": "XTF", ".jsf": "JSF", ".s7k": "S7K"}
    file_format = format_map.get(ext, "OTHER")
    # XTF is typically SSS; JSF can be ARIS or SSS
    sensor_type = "SSS" if ext == ".xtf" else "UNKNOWN"

    # ── 5. Insert into Supabase ────────────────────────────────
    try:
        db = get_supabase()
        row = {
            "id": session_id,
            "filename": file.filename,
            "sensor_type": sensor_type,
            "file_format": file_format,
            "file_size_bytes": len(content),
            "status": "pending",
            "upload_path": str(save_path),
        }
        db.table("sonar_sessions").insert(row).execute()
        logger.info("Created sonar_session %s in Supabase", session_id)
    except Exception as exc:
        logger.error("Supabase insert failed: %s", exc)
        raise HTTPException(
            status_code=502,
            detail=f"Database write failed: {exc}",
        )

    return {
        "session_id": session_id,
        "filename": file.filename,
        "file_format": file_format,
        "file_size_bytes": len(content),
        "status": "pending",
    }
