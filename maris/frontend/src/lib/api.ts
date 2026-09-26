/**
 * Typed API client for the MARIS FastAPI backend.
 * All calls go through the Next.js rewrite proxy → localhost:8000.
 */

const BASE = '/api/v1';

export async function uploadSonarFile(file: File): Promise<unknown> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
  return res.json();
}

export async function runInference(sessionId: string): Promise<unknown> {
  const res = await fetch(`${BASE}/infer/${sessionId}`, { method: 'POST' });
  if (!res.ok) throw new Error(`Inference failed: ${res.statusText}`);
  return res.json();
}

export async function getReport(sessionId: string, fmt: 'geojson' | 'csv' = 'geojson'): Promise<unknown> {
  const res = await fetch(`${BASE}/reports/${sessionId}?fmt=${fmt}`);
  if (!res.ok) throw new Error(`Report failed: ${res.statusText}`);
  return res.json();
}
