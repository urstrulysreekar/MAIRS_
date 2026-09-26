"""
Centralised settings loaded from environment / .env file.
"""

from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path


class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # Model paths
    YOLO_WEIGHTS_PATH: str = "./weights/best.pt"
    ONNX_MODEL_PATH: str = "./weights/best.onnx"

    # Upload & processing
    UPLOAD_DIR: str = "./uploads"
    PROCESSED_DIR: str = "./processed"

    # Inference
    CONF_THRESHOLD: float = 0.25
    IOU_THRESHOLD: float = 0.45
    IMG_SIZE: int = 640

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    def ensure_dirs(self):
        """Create upload and processed directories if they don't exist."""
        Path(self.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
        Path(self.PROCESSED_DIR).mkdir(parents=True, exist_ok=True)


settings = Settings()
settings.ensure_dirs()
