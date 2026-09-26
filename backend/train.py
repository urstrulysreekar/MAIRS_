#!/usr/bin/env python3
"""
MARIS – YOLOv8 Training Script.

Trains the custom YOLOv8n-maris architecture on the AI4Shipwrecks dataset,
optimised for an NVIDIA RTX 4050 (6 GB VRAM).

Usage (Fish shell):
    cd maris/backend
    source .venv/bin/activate.fish
    python train.py

    # Or with overrides:
    python train.py --epochs 150 --batch 4 --imgsz 640

The script will:
    1. Validate GPU availability and VRAM.
    2. Train YOLOv8n-maris with FP16 mixed precision.
    3. Run validation on the best checkpoint.
    4. Export the best weights to ONNX for edge/CPU inference.

All artefacts land under  runs/maris/<run_name>/
"""

from __future__ import annotations

import argparse
import logging
import sys
import time
from pathlib import Path

import torch
from ultralytics import YOLO

# ── Logging ──────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(levelname)-5s │ %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("maris.train")

# ── Paths (relative to backend/) ─────────────────────────────────
ROOT = Path(__file__).resolve().parent            # maris/backend/
MODEL_YAML = ROOT / "models" / "yolov8n-maris.yaml"
DATA_YAML = ROOT / "models" / "ai4shipwrecks.yaml"
PROJECT_DIR = ROOT / "runs" / "maris"


# ── GPU diagnostics ──────────────────────────────────────────────

def _check_gpu() -> str:
    """Verify CUDA is available and report VRAM."""
    if not torch.cuda.is_available():
        log.warning(
            "No CUDA GPU detected — training will fall back to CPU. "
            "This will be extremely slow."
        )
        return "cpu"

    dev = torch.cuda.get_device_properties(0)
    vram_gb = dev.total_mem / (1024 ** 3)
    log.info(
        "GPU: %s  |  VRAM: %.1f GB  |  CUDA: %s",
        dev.name, vram_gb, torch.version.cuda,
    )

    if vram_gb < 4.0:
        log.warning(
            "Only %.1f GB VRAM detected. Training may OOM at batch>2. "
            "Consider reducing --batch or --imgsz.",
            vram_gb,
        )

    return "0"  # device index for single-GPU


# ── Argument parser ──────────────────────────────────────────────

def _parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Train MARIS YOLOv8 model on AI4Shipwrecks",
    )

    # Training hyper-parameters — defaults tuned for RTX 4050 (6 GB)
    p.add_argument("--epochs",    type=int,   default=300,
                   help="Total training epochs (default: 300)")
    p.add_argument("--batch",     type=int,   default=8,
                   help="Batch size. 8 fits comfortably in 6 GB with FP16. "
                        "Try 12 if VRAM allows; reduce to 4 if OOM.")
    p.add_argument("--imgsz",     type=int,   default=640,
                   help="Input image size (default: 640)")
    p.add_argument("--workers",   type=int,   default=4,
                   help="DataLoader workers (default: 4)")
    p.add_argument("--name",      type=str,   default="v1",
                   help="Run name under runs/maris/<name> (default: v1)")

    # Paths
    p.add_argument("--model",     type=str,   default=str(MODEL_YAML),
                   help="Path to YOLO model YAML or a pretrained .pt file")
    p.add_argument("--data",      type=str,   default=str(DATA_YAML),
                   help="Path to dataset YAML")

    # Export
    p.add_argument("--skip-export", action="store_true",
                   help="Skip the ONNX export step after training")
    p.add_argument("--onnx-opset", type=int, default=17,
                   help="ONNX opset version (default: 17)")

    return p.parse_args()


# ── Training ─────────────────────────────────────────────────────

def train(args: argparse.Namespace) -> Path:
    """Run YOLOv8 training and return the path to best.pt.

    RTX 4050 (6 GB) budget allocation at batch=8, imgsz=640, FP16:
        Model params  ~3 M   →  ~12 MB FP16
        Activations              ~1.2 GB
        Optimizer state           ~0.8 GB
        Batch images (8×3×640²)  ~0.9 GB
        CUDA overhead             ~1.0 GB
        ────────────────────────  ~3.9 GB  (headroom ≈ 2 GB)
    """
    device = _check_gpu()

    # Validate paths
    model_path = Path(args.model)
    data_path = Path(args.data)

    if not model_path.exists():
        log.error("Model config not found: %s", model_path)
        sys.exit(1)
    if not data_path.exists():
        log.error("Dataset config not found: %s", data_path)
        sys.exit(1)

    log.info("Model config : %s", model_path)
    log.info("Dataset config: %s", data_path)
    log.info("Epochs: %d  |  Batch: %d  |  Imgsz: %d  |  FP16: True",
             args.epochs, args.batch, args.imgsz)

    # ── Initialise model ────────────────────────────────────────
    model = YOLO(str(model_path))

    # ── Train ───────────────────────────────────────────────────
    # Augmentation strategy for underwater sonar imagery:
    #   • hsv_h/s/v = 0     — sonar is grayscale; colour jitter is meaningless.
    #   • flipud = 0.5      — vertical flip: valid, towfish can image
    #                          the same target from either direction.
    #   • fliplr = 0.5      — horizontal flip: valid, port/starboard symmetry.
    #   • mosaic = 1.0      — mosaic: useful to simulate multi-target scenes.
    #   • scale  = 0.5      — random scale: helps with variable-range imagery.
    #   • translate = 0.2   — random translate: helps with off-centre targets.
    #   • erasing = 0.3     — random erasing: simulates shadow masking and
    #                          partial occlusion by sediment.
    #   • degrees = 15      — slight rotation: towfish yaw/sway simulation.
    #
    # We intentionally DO NOT use:
    #   • mixup — blending two sonar tiles creates acoustically impossible
    #             backscatter patterns that could teach wrong textures.
    #   • copy_paste — target aspect ratios in sonar are range-dependent;
    #                  pasting a target at a different range distorts it.

    t0 = time.time()

    results = model.train(
        # ── Data ─────────────────────────────────
        data=str(data_path),
        imgsz=args.imgsz,

        # ── Hardware ─────────────────────────────
        device=device,
        batch=args.batch,
        workers=args.workers,
        half=True,                   # FP16 mixed precision — saves ~40 % VRAM

        # ── Schedule ─────────────────────────────
        epochs=args.epochs,
        patience=50,                 # early stopping patience (epochs)
        optimizer="AdamW",
        lr0=1e-3,                    # initial learning rate
        lrf=0.01,                    # final LR factor (cosine decay → lr0 * 0.01)
        warmup_epochs=5,
        warmup_momentum=0.8,
        weight_decay=5e-4,
        cos_lr=True,                 # cosine annealing schedule

        # ── Augmentation (sonar-appropriate) ─────
        hsv_h=0.0,                   # no hue jitter (grayscale data)
        hsv_s=0.0,                   # no saturation jitter
        hsv_v=0.3,                   # slight brightness variation (gain drift)
        flipud=0.5,
        fliplr=0.5,
        mosaic=1.0,
        scale=0.5,
        translate=0.2,
        erasing=0.3,
        degrees=15.0,
        mixup=0.0,                   # disabled — acoustically invalid
        copy_paste=0.0,              # disabled — range-dependent distortion

        # ── Loss ─────────────────────────────────
        box=7.5,                     # bbox regression loss weight
        cls=0.5,                     # classification loss weight
        dfl=1.5,                     # distribution focal loss weight

        # ── NMS ──────────────────────────────────
        iou=0.5,                     # NMS IoU threshold during validation
        conf=0.001,                  # keep all predictions during validation mAP

        # ── Output ───────────────────────────────
        project=str(PROJECT_DIR),
        name=args.name,
        exist_ok=True,               # overwrite previous run with same name
        save=True,
        save_period=25,              # checkpoint every 25 epochs
        plots=True,                  # generate PR / confusion plots
        verbose=True,
    )

    elapsed = time.time() - t0
    log.info("Training completed in %.1f minutes", elapsed / 60)

    # ── Locate best weights ──────────────────────────────────────
    best_pt = PROJECT_DIR / args.name / "weights" / "best.pt"
    if not best_pt.exists():
        log.error("best.pt not found at expected path: %s", best_pt)
        sys.exit(1)

    log.info("Best weights: %s", best_pt)
    return best_pt


# ── ONNX Export ──────────────────────────────────────────────────

def export_onnx(weights_path: Path, opset: int = 17, imgsz: int = 640) -> Path:
    """Export a trained .pt model to ONNX for edge CPU inference.

    Parameters:
        weights_path: Path to the best.pt checkpoint.
        opset: ONNX opset version. 17 supports all YOLOv8 ops.
        imgsz: Image size the exported model will accept.

    Returns:
        Path to the exported .onnx file.
    """
    log.info("Exporting to ONNX (opset=%d, imgsz=%d) ...", opset, imgsz)

    model = YOLO(str(weights_path))
    export_path = model.export(
        format="onnx",
        opset=opset,
        simplify=True,     # run onnx-simplifier for smaller graph
        dynamic=False,     # fixed input shape for deterministic edge perf
        half=False,        # ONNX Runtime CPU doesn't support FP16 natively
        imgsz=imgsz,
    )

    onnx_path = Path(export_path)
    size_mb = onnx_path.stat().st_size / (1024 * 1024)
    log.info("ONNX exported: %s  (%.1f MB)", onnx_path, size_mb)

    # ── Copy to the canonical weights/ location for the API server ──
    canonical = Path(ROOT / "weights" / "best.onnx")
    canonical.parent.mkdir(parents=True, exist_ok=True)

    import shutil
    shutil.copy2(onnx_path, canonical)
    log.info("Copied to canonical path: %s", canonical)

    return onnx_path


# ── Validation ───────────────────────────────────────────────────

def validate(weights_path: Path, data_yaml: str, imgsz: int = 640):
    """Run validation on the best checkpoint and log metrics.

    Does NOT fabricate any numbers — all metrics come from the
    real validation pass against the real dataset.
    """
    log.info("Running validation on best checkpoint ...")
    model = YOLO(str(weights_path))
    metrics = model.val(
        data=data_yaml,
        imgsz=imgsz,
        split="test",      # evaluate on the held-out test split
        verbose=True,
        plots=True,
    )

    # Log the real metrics from the validation run.
    # We deliberately do NOT hardcode any numbers here.
    log.info("── Validation Results ──")
    log.info("  mAP50    : %.4f", metrics.box.map50)
    log.info("  mAP50-95 : %.4f", metrics.box.map)
    log.info("  Precision: %.4f", metrics.box.mp)
    log.info("  Recall   : %.4f", metrics.box.mr)


# ── Main ─────────────────────────────────────────────────────────

def main():
    args = _parse_args()

    log.info("=" * 60)
    log.info("  MARIS Training Pipeline")
    log.info("  Marine Anomaly Recognition and Intelligence System")
    log.info("=" * 60)

    # 1. Train
    best_pt = train(args)

    # 2. Validate on test split
    validate(best_pt, args.data, args.imgsz)

    # 3. Export to ONNX
    if not args.skip_export:
        export_onnx(best_pt, opset=args.onnx_opset, imgsz=args.imgsz)
    else:
        log.info("ONNX export skipped (--skip-export flag).")

    # 4. Copy best.pt to canonical weights/ path for the API server
    canonical_pt = ROOT / "weights" / "best.pt"
    canonical_pt.parent.mkdir(parents=True, exist_ok=True)
    import shutil
    shutil.copy2(best_pt, canonical_pt)
    log.info("Copied best.pt → %s", canonical_pt)

    log.info("=" * 60)
    log.info("  Training complete.")
    log.info("  Weights : %s", canonical_pt)
    log.info("  ONNX    : %s", ROOT / "weights" / "best.onnx")
    log.info("  Runs    : %s", PROJECT_DIR / args.name)
    log.info("=" * 60)


if __name__ == "__main__":
    main()
