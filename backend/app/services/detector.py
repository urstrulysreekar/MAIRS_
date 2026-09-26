"""
MARIS – YOLOv8 Anomaly Detector.

Handles model loading, inference, and ONNX export.

┌──────────────────────────────────────────────────────────────┐
│  ARCHITECTURE NOTES (for hackathon fine-tuning)              │
│                                                              │
│  1. DYSAMPLE UPSAMPLING                                     │
│     Default YOLOv8 uses nearest-neighbour upsampling in the  │
│     FPN neck. For small underwater targets (ghost nets,      │
│     thin wreck edges), replace with DySample:                │
│                                                              │
│     In ultralytics/nn/modules/block.py, find the Upsample    │
│     calls in the C2f / SPPF neck and swap:                   │
│                                                              │
│       # BEFORE (default):                                    │
│       self.up = nn.Upsample(scale_factor=2, mode='nearest') │
│                                                              │
│       # AFTER (DySample):                                    │
│       from models.dysample import DySample                   │
│       self.up = DySample(in_ch, scale=2, style='lp',         │
│                          groups=4, end_convolution=True)      │
│                                                              │
│     DySample learns per-pixel upsampling offsets, preserving │
│     fine-grained edge detail that nearest-neighbour destroys.│
│     Paper: "Learning to Upsample by Learning to Sample"      │
│     (ICCV 2023).                                             │
│                                                              │
│  2. GLCM TEXTURE DESCRIPTORS (anti-camouflage)               │
│     Sonar debris is often iso-textural with the seabed.      │
│     Stack GLCM features as extra input channels:             │
│                                                              │
│       import skimage.feature as skf                          │
│       glcm = skf.graycomatrix(tile, distances=[1,3,5],       │
│                  angles=[0, np.pi/4, np.pi/2, 3*np.pi/4],   │
│                  levels=256, symmetric=True, normed=True)    │
│       contrast   = skf.graycoprops(glcm, 'contrast')         │
│       homogeneity = skf.graycoprops(glcm, 'homogeneity')     │
│       energy     = skf.graycoprops(glcm, 'energy')           │
│       correlation = skf.graycoprops(glcm, 'correlation')     │
│                                                              │
│     Reshape these 4 feature maps to match tile HxW and       │
│     concatenate with the original grayscale tile to produce  │
│     a 5-channel input tensor. Modify the YOLOv8 yaml:        │
│                                                              │
│       # In yolov8n-maris.yaml:                               │
│       backbone:                                              │
│         - [-1, 1, Conv, [64, 3, 2]]  # ch0 → set ch0=5      │
│                                                              │
│     This gives the model texture-awareness that raw pixel    │
│     intensity alone cannot provide on low-contrast seabed.   │
└──────────────────────────────────────────────────────────────┘
"""

from __future__ import annotations

import logging
from pathlib import Path
from dataclasses import dataclass
from typing import Literal

import numpy as np

logger = logging.getLogger(__name__)


@dataclass
class Detection:
    """A single bounding-box detection."""
    class_name: str
    confidence: float            # 0.0–1.0, raw from model
    bbox: tuple[float, float, float, float]  # (x1, y1, x2, y2) in pixels
    tile_index: int | None = None
    ping_start: int | None = None
    ping_end: int | None = None


# ── Hazard class mapping ─────────────────────────────────────
# Must match the training data labels (AI4Shipwrecks + custom)
CLASS_MAP: dict[int, str] = {
    0: "ghost_net",
    1: "wreck_debris",
    2: "uxo",
    3: "pipeline",
    4: "geological",
    5: "biological",
    6: "unknown",
}


class MARISDetector:
    """YOLOv8-based anomaly detector for sonar imagery.

    Supports:
      - Native PyTorch weights  (.pt)
      - ONNX Runtime inference  (.onnx) for edge deployment
    """

    def __init__(
        self,
        weights_path: str | Path,
        device: str = "auto",
        conf_threshold: float = 0.25,
        iou_threshold: float = 0.45,
        img_size: int = 640,
    ):
        self.weights_path = Path(weights_path)
        self.device = device
        self.conf_threshold = conf_threshold
        self.iou_threshold = iou_threshold
        self.img_size = img_size
        self._model = None

        if not self.weights_path.exists():
            logger.warning(
                "Model weights not found at %s. "
                "Inference will raise NotImplementedError until "
                "a trained checkpoint is placed here.",
                self.weights_path,
            )

    def _load_model(self):
        """Lazy-load the YOLO model."""
        if self._model is not None:
            return

        if not self.weights_path.exists():
            raise NotImplementedError(
                f"No model weights at {self.weights_path}. "
                f"Train on AI4Shipwrecks first, then place best.pt here."
            )

        from ultralytics import YOLO
        self._model = YOLO(str(self.weights_path))
        logger.info("Loaded YOLO model from %s", self.weights_path)

    def predict(self, image_path: str | Path) -> list[Detection]:
        """Run inference on a single sonar tile.

        Parameters:
            image_path: Path to a corrected sonar tile PNG.

        Returns:
            List of Detection objects.

        Raises:
            NotImplementedError: If model weights are missing.
        """
        self._load_model()

        results = self._model.predict(
            source=str(image_path),
            conf=self.conf_threshold,
            iou=self.iou_threshold,
            imgsz=self.img_size,
            verbose=False,
        )

        detections: list[Detection] = []
        for result in results:
            boxes = result.boxes
            if boxes is None:
                continue
            for i in range(len(boxes)):
                cls_id = int(boxes.cls[i].item())
                conf = float(boxes.conf[i].item())
                x1, y1, x2, y2 = boxes.xyxy[i].tolist()
                detections.append(Detection(
                    class_name=CLASS_MAP.get(cls_id, "unknown"),
                    confidence=conf,
                    bbox=(x1, y1, x2, y2),
                ))

        return detections

    def predict_batch(self, tile_paths: list[str | Path]) -> dict[str, list[Detection]]:
        """Run inference on multiple tiles.

        Returns:
            Dict mapping tile path → list of detections.
        """
        results: dict[str, list[Detection]] = {}
        for path in tile_paths:
            results[str(path)] = self.predict(path)
        return results

    def export_onnx(
        self,
        output_path: str | Path | None = None,
        opset: int = 17,
        simplify: bool = True,
        dynamic: bool = False,
    ) -> Path:
        """Export the loaded model to ONNX for edge inference.

        Parameters:
            output_path: Where to save .onnx file. Defaults to
                         same directory as weights.
            opset: ONNX opset version.
            simplify: Run onnx-simplifier.
            dynamic: Allow dynamic batch/image sizes.

        Returns:
            Path to the exported ONNX file.

        Raises:
            NotImplementedError: If model weights are missing.
        """
        self._load_model()

        export_args = dict(
            format="onnx",
            opset=opset,
            simplify=simplify,
            dynamic=dynamic,
            imgsz=self.img_size,
        )

        result_path = self._model.export(**export_args)
        logger.info("Exported ONNX model to %s", result_path)
        return Path(result_path)
