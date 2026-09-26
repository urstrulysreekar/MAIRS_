import { HazardClass } from './types';

/**
 * Procedural Sonar Acoustic Waterfall & Snippet Generator.
 * Creates authentic side-scan sonar acoustic textures (nadir blind zone,
 * grazing-angle acoustic shadow, specular highlight, and seabed backscatter)
 * using client-side canvas/SVG rendering with zero external image assets.
 */

export function drawSonarCanvas(
  canvas: HTMLCanvasElement,
  hazardClass: HazardClass,
  seed: number,
  width: number = 240,
  height: number = 160
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = width;
  canvas.height = height;

  // 1. Base dark copper-amber / navy acoustic colormap background
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#0c121e');
  grad.addColorStop(0.5, '#182436');
  grad.addColorStop(1, '#0c121e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2. Grainy seabed acoustic backscatter speckle
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  for (let i = 0; i < data.length; i += 4) {
    const noise = (rnd() - 0.5) * 42;
    data[i] = Math.min(255, Math.max(0, data[i] + noise + 18));     // Copper tint
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.9 + 28)); // Sonar cyan/blue tint
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 1.3 + 38));
  }
  ctx.putImageData(imgData, 0, 0);

  // 3. Towfish along-track striping (vibration / ping lines)
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
  ctx.lineWidth = 1;
  for (let y = 0; y < height; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y + (rnd() - 0.5) * 2);
    ctx.lineTo(width, y + (rnd() - 0.5) * 2);
    ctx.stroke();
  }

  // 4. Draw Specific Acoustic Hazard Signature
  const cx = width / 2;
  const cy = height / 2;

  ctx.save();
  ctx.translate(cx, cy);

  if (hazardClass === 'ghost_net') {
    // Entangled fibrous web with acoustic shadow behind it
    // Acoustic shadow (dark blackout zone)
    ctx.fillStyle = 'rgba(2, 6, 12, 0.85)';
    ctx.beginPath();
    ctx.ellipse(32, 8, 38, 20, Math.PI / 8, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlight filaments (bright cyan-amber backscatter)
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let j = 0; j < 14; j++) {
      const angle = (j / 14) * Math.PI * 2;
      const r = 24 + rnd() * 12;
      const px = Math.cos(angle) * r - 12;
      const py = Math.sin(angle) * (r * 0.6);
      if (j === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();

    // Internal netting mesh
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    for (let k = -20; k <= 20; k += 6) {
      ctx.moveTo(k - 10, -15);
      ctx.lineTo(k + 5, 15);
    }
    ctx.stroke();
  } else if (hazardClass === 'wreck_debris') {
    // Sharp hull framing / geometric debris with long acoustic shadow
    ctx.fillStyle = 'rgba(2, 6, 12, 0.92)';
    ctx.beginPath();
    ctx.moveTo(15, -20);
    ctx.lineTo(65, -12);
    ctx.lineTo(55, 30);
    ctx.lineTo(10, 18);
    ctx.closePath();
    ctx.fill();

    // Bright metallic/timber specular ribbing
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-30, -18, 42, 34);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-30, -18, 42, 34);

    // Bulkhead ribs
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    for (let rx = -24; rx <= 6; rx += 8) {
      ctx.beginPath();
      ctx.moveTo(rx, -18);
      ctx.lineTo(rx, 16);
      ctx.stroke();
    }
  } else if (hazardClass === 'pipeline') {
    // Linear continuous reflective cylinder with parallel acoustic shadow
    ctx.fillStyle = 'rgba(2, 6, 12, 0.88)';
    ctx.fillRect(8, -height / 2, 14, height);

    ctx.fillStyle = '#a855f7';
    ctx.fillRect(-8, -height / 2, 10, height);

    ctx.strokeStyle = '#e9d5ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-4, -height / 2);
    ctx.lineTo(-4, height / 2);
    ctx.stroke();
  } else if (hazardClass === 'uxo') {
    // Cylindrical small high-density metallic casing with sharp point shadow
    ctx.fillStyle = 'rgba(2, 6, 12, 0.95)';
    ctx.beginPath();
    ctx.ellipse(24, 0, 30, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hot metallic highlight
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(-18, -6, 26, 12, 4);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (hazardClass === 'biological') {
    // Irregular porous coral reef cluster
    ctx.fillStyle = 'rgba(2, 6, 12, 0.75)';
    ctx.beginPath();
    ctx.arc(20, 4, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#10b981';
    for (let b = 0; b < 18; b++) {
      const bx = (rnd() - 0.5) * 36 - 8;
      const by = (rnd() - 0.5) * 28;
      const br = 2 + rnd() * 4;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Geological boulder outcrop
    ctx.fillStyle = 'rgba(2, 6, 12, 0.8)';
    ctx.beginPath();
    ctx.arc(22, 6, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(-18, -12);
    ctx.lineTo(8, -18);
    ctx.lineTo(16, 12);
    ctx.lineTo(-12, 18);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();

  // 5. Target Bounding Box Crosshair Overlay
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.85)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(cx - 36, cy - 28, 72, 56);

  // Corner brackets
  const bSize = 6;
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 2.0;

  // Top Left
  ctx.beginPath();
  ctx.moveTo(cx - 36, cy - 28 + bSize);
  ctx.lineTo(cx - 36, cy - 28);
  ctx.lineTo(cx - 36 + bSize, cy - 28);
  ctx.stroke();

  // Top Right
  ctx.beginPath();
  ctx.moveTo(cx + 36 - bSize, cy - 28);
  ctx.lineTo(cx + 36, cy - 28);
  ctx.lineTo(cx + 36, cy - 28 + bSize);
  ctx.stroke();

  // Bottom Left
  ctx.beginPath();
  ctx.moveTo(cx - 36, cy + 28 - bSize);
  ctx.lineTo(cx - 36, cy + 28);
  ctx.lineTo(cx - 36 + bSize, cy + 28);
  ctx.stroke();

  // Bottom Right
  ctx.beginPath();
  ctx.moveTo(cx + 36 - bSize, cy + 28);
  ctx.lineTo(cx + 36, cy + 28);
  ctx.lineTo(cx + 36, cy + 28 - bSize);
  ctx.stroke();

  // Coordinates watermark in bottom left
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '9px monospace';
  ctx.fillText(`YOLOv8-GLCM · CONF: ${(0.82 + (seed % 17) * 0.01).toFixed(2)}`, 8, height - 8);
}
