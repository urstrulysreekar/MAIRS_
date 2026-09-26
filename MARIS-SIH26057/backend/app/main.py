"""
MARIS Backend – FastAPI entry point.

Run with:
    uvicorn app.main:app --reload --port 8000
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import upload, infer, reports
from app.core.config import settings

# ── Logging ──────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(name)-28s │ %(levelname)-5s │ %(message)s",
    datefmt="%H:%M:%S",
)

app = FastAPI(
    title="MARIS API",
    description="Marine Anomaly Recognition and Intelligence System – SIH26057",
    version="0.2.0",
)

# CORS – allow the Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Route registration ────────────────────────────────────────
app.include_router(upload.router, prefix="/api/v1")
app.include_router(infer.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "maris-backend", "version": "0.2.0"}
