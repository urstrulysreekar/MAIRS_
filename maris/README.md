# MARIS — Marine Anomaly Recognition and Intelligence System

> **SIH26057 Hackathon Submission**  
> Real-time acoustic anomaly recognition, motion-corrected swath mosaicking (UNDROIP), and sub-meter PostGIS spatial geotagging for underwater hazard detection.

---

## ⚡ Zero-Config Demo Mode (Instant Evaluation)

MARIS features a deterministic, seeded client-side demonstration layer (`/lib/demo/`) that powers the complete operations dashboard with **no backend, no database setup, and no API keys required**.

### Quick Start (Fish Shell)

```fish
# 1. Enter frontend directory and install dependencies
cd maris/frontend
npm install --legacy-peer-deps

# 2. Launch Next.js 15 dev server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser. The dashboard loads immediately with 24 surveys, ~320 anomalies, interactive 3D WebGL visuals, real-time toast alerts, and Recharts analytics.

---

## 🎛️ Demo Mode Configuration & Toggling

| Setting | Location | Default | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_DEMO_MODE` | `frontend/.env.local` | `true` | When `true`, uses the reactive Seeded PRNG store (seed `26057`). When `false`, seamlessly falls through to live Supabase PostGIS instances. |
| **One-Click Reset** | UI Top Bar Badge | — | Click the **"Reset"** pill in the top navigation bar at any time to restore the factory demo state. |

---

## ⏱️ 90-Second Jury Demonstration Script

Follow this step-by-step sequence during your presentation:

1. **00:00 - 00:20 │ Operations Console (`/`)**
   * **Visual:** Point to the 3D WebGL undulating sea and hover the morphing anomaly orb on the right (watch it distort and turn hot-red).
   * **Highlight:** Point out the **6 Live KPI Cards** (320+ anomalies, 24 surveys, active workers, seabed km²).
   * **Live Stream:** Show the **Live Sonar Telemetry Stream** receiving new incoming detections every 4-6 seconds with visual toasts in the bottom right corner.
   * **Action:** Click any row in the live stream to slide out the **Anomaly Detail Drawer** showing the procedural acoustic backscatter waterfall, PostGIS coordinates, and operational action buttons (*Verify*, *Dispatch*, *Jump to Map*).

2. **00:20 - 00:45 │ PostGIS Swath Map (`/map`)**
   * **Visual:** Switch to the PostGIS Map. Point out the dark nautical CARTO basemap, color-coded taxonomy markers, survey tracklines, and swath bounding polygons.
   * **Action:** Use the **"Jump to Survey Zone"** dropdown in the top left (select *Gulf of Mannar*, *Visakhapatnam Shelf*, or *Mumbai Offshore*) to watch the camera fly smoothly to real cluster locations.
   * **Interactive Tool:** Toggle the **"Heatmap"** button to show hazard density hot-spots, and use the **"Measure"** tool to click two points and compute acoustic ground-range distance in meters.

3. **00:45 - 01:10 │ Telemetry Ingestion Pipeline (`/upload`)**
   * **Visual:** Navigate to the Ingestion page.
   * **Action:** Click the **"Try Sample Survey (1-Click)"** button.
   * **Highlight:** Watch the real-time terminal log simulate the 5 processing stages:
     1. *Binary Ingestion*
     2. *UNDROIP 3-Axis IMU Attitude Compensation*
     3. *Slant-Range Mosaicking & 2D-FFT Noise Filtering*
     4. *YOLOv8-DySample 5-Channel GLCM Texture Detection*
     5. *PostGIS Sub-Meter Geotagging*
   * **Proof:** On completion, click **"Focus Survey on PostGIS Map"** to see the 12 newly isolated targets injected live into the system.

4. **01:10 - 01:30 │ Target Inventory (`/anomalies`) & Executive Dossier (`/reports`)**
   * **Inventory:** Show the master table with multi-column sorting, pagination, and one-click **CSV Export**.
   * **Reports:** Open the Executive Dossier generator and click **"Print / Save PDF"** to display the hydrographic intelligence sign-off document.

---

## 🗺️ Application Routes

| Route | View Name | Purpose |
| :--- | :--- | :--- |
| **`/`** | Operations Console | KPI metrics, Recharts analytics, 3D WebGL target visual, and live telemetry stream. |
| **`/map`** | PostGIS Swath Map | Clustered Leaflet markers, CARTO dark basemap, swath polygons, heatmap, and distance measurement. |
| **`/upload`** | Sonar Ingestion | Drag-and-drop `.XTF` / `.JSF` ingestion with live terminal logs and 1-click sample demo. |
| **`/anomalies`** | Target Inventory | Master tabular dataset with multi-column sorting, search, pagination, and CSV export. |
| **`/reports`** | Executive Reports | Printable survey dossier with acoustic dossiers, metadata breakdown, and official sign-off. |

---

## 🏗️ Architecture Stack

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS v4, Framer Motion, Recharts, React-Leaflet, Three.js / React Three Fiber.
- **Backend:** FastAPI, Python 3.11, pyxtf, OpenCV, NumPy, SciPy, scikit-image.
- **ML / Detection:** YOLOv8 with custom DySample FPN and 5-channel GLCM texture maps (`models/yolov8n-maris.yaml`).
- **Database:** Supabase with PostGIS spatial geometry indexing (`supabase/schema.sql`).
