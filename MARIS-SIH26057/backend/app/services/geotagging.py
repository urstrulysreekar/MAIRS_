"""
MARIS – Geotagging Service.

Extracts GPS coordinates from side-scan sonar ping headers (XTF format)
and maps pixel-space bounding boxes to real-world lat/lon.

Coordinate Geometry
───────────────────
Side-scan sonar imagery has two axes:

    Along-track (Y axis / rows)
        Each row of pixels corresponds to one ping.  The ping header
        carries the GNSS position of the towfish at the moment of
        transmission.  Mapping a pixel row → ping index → lat/lon is
        a simple linear interpolation along the track.

    Across-track (X axis / columns)
        Each column corresponds to a slant-range sample.  The towfish
        is at the nadir (centre column).  Port samples extend left,
        starboard samples extend right.  The ground-range distance of
        a column from nadir is:

            ground_range = column_offset × sample_interval_m

        where sample_interval_m is derived from:

            sample_interval_m = SlantRange / NumSamples

        The across-track offset is then projected onto the WGS 84
        ellipsoid using the local tangent-plane approximation:

            Δlat =  offset_m × cos(heading) / M
            Δlon =  offset_m × sin(heading) / (N × cos(lat))

        where M ≈ 111 320 m/° and N ≈ 111 320 m/° are the meridional
        and prime-vertical radii of curvature (spherical approximation
        adequate for ≤ 200 m offsets).

        The sign convention is:
            heading = 0°   → towfish moves North
            heading = 90°  → towfish moves East
            offset > 0     → starboard (right of track)
            offset < 0     → port      (left of track)

        The across-track displacement is PERPENDICULAR to the heading,
        so we rotate by +90° for the starboard direction:

            bearing = heading + 90°     (for starboard offset)
            Δlat = offset_m × cos(bearing) / M
            Δlon = offset_m × sin(bearing) / (N × cos(lat))
"""

from __future__ import annotations

import logging
import math
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional

import numpy as np

logger = logging.getLogger(__name__)

# ── Constants ────────────────────────────────────────────────────

# Metres per degree latitude on the WGS 84 ellipsoid (spherical approx).
# True value varies 110 574 m/° (equator) – 111 694 m/° (pole);
# 111 320 is the mean, accurate to ±0.4 % for local offsets < 1 km.
_M_PER_DEG = 111_320.0

# Threshold below which we consider coordinates to be "no GPS fix"
# (many sonar loggers write 0.0 / 0.0 when the GNSS receiver has no fix).
_ZERO_COORD_THRESHOLD = 1e-6

# Maximum plausible coordinate for geographic (lat/lon) data.
# Values beyond ±180° indicate the logger is storing projected
# easting/northing (e.g. UTM metres) rather than degrees.
_GEO_COORD_MAX = 180.0


# ── Data containers ──────────────────────────────────────────────

@dataclass
class GeoPoint:
    """A single georeferenced point."""
    latitude: float
    longitude: float
    depth_m: Optional[float] = None
    altitude_m: Optional[float] = None
    ping_index: int = 0
    crs_epsg: int = 4326


@dataclass
class PingGeoHeader:
    """GPS + attitude data extracted from one ping header."""
    ping_index: int
    timestamp_us: int
    latitude: float
    longitude: float
    heading_deg: float
    speed_kn: float
    depth_m: float
    altitude_m: float
    samples_per_channel: int
    sample_interval_m: float  # ground-range distance per sample


# ── XTF ping-header extraction ───────────────────────────────────

def _is_planar_coords(x: float, y: float) -> bool:
    """Heuristic: are (x, y) projected easting/northing rather than lon/lat?

    Many XTF loggers store UTM easting in SensorXcoordinate and
    UTM northing in SensorYcoordinate.  These values are typically
    in the hundreds-of-thousands (e.g. 500 000 E, 6 200 000 N),
    far exceeding the ±180° range of geographic coordinates.
    """
    return abs(x) > _GEO_COORD_MAX or abs(y) > _GEO_COORD_MAX


def extract_ping_geo_headers(xtf_path: str | Path) -> list[PingGeoHeader]:
    """Parse an XTF file and extract per-ping GPS/attitude headers.

    Uses ``pyxtf`` to read the XTF file header and sonar packets.
    Each sonar ping contains embedded navigation data from the
    towfish or vessel GNSS receiver.

    Coordinate handling:
        • If SensorX/Y fit within ±180°, they are treated as
          longitude / latitude (geographic, WGS 84).
        • If they exceed ±180°, they are assumed to be projected
          easting / northing.  A warning is logged and the raw
          values are stored as-is.  Downstream callers should use
          ``pyproj`` to reproject if a CRS EPSG code is known from
          the file header or the sonar_sessions table.

    Parameters:
        xtf_path: Path to the XTF sonar log.

    Returns:
        Ordered list of PingGeoHeader, one per sonar ping, sorted
        by ping index.

    Raises:
        FileNotFoundError: If the XTF file does not exist.
        ValueError: If the file contains no sonar packets.
        RuntimeError: If pyxtf cannot parse the file (corrupt /
                      wrong format / missing magic number).
    """
    xtf_path = Path(xtf_path)
    if not xtf_path.exists():
        raise FileNotFoundError(f"XTF file not found: {xtf_path}")

    # ── Import pyxtf (fail loudly if not installed) ──────────────
    try:
        import pyxtf
    except ImportError as exc:
        raise ImportError(
            "pyxtf is required for XTF parsing. "
            "Install it:  pip install pyxtf"
        ) from exc

    # ── Parse ────────────────────────────────────────────────────
    try:
        (file_header, packets) = pyxtf.xtf_read(str(xtf_path))
    except Exception as exc:
        raise RuntimeError(
            f"pyxtf failed to parse {xtf_path.name}: {exc}"
        ) from exc

    sonar_packets = packets.get(pyxtf.XTFHeaderType.sonar, [])
    if not sonar_packets:
        raise ValueError(
            f"No sonar packets found in {xtf_path.name}. "
            f"Available packet types: {list(packets.keys())}"
        )

    logger.info(
        "Parsed %s: %d sonar pings",
        xtf_path.name, len(sonar_packets),
    )

    # ── Check coordinate system on the first ping ────────────────
    first = sonar_packets[0]
    planar = _is_planar_coords(
        first.SensorXcoordinate, first.SensorYcoordinate
    )
    if planar:
        logger.warning(
            "XTF coordinates appear to be projected (easting/northing), "
            "not geographic (lon/lat).  First ping: X=%.2f  Y=%.2f.  "
            "Downstream code should reproject using the session CRS EPSG.",
            first.SensorXcoordinate, first.SensorYcoordinate,
        )

    # ── Extract headers ──────────────────────────────────────────
    headers: list[PingGeoHeader] = []
    nav_missing_count = 0

    for pkt in sonar_packets:
        # ── Coordinate extraction ────────────────────────────────
        # XTF convention:
        #   SensorXcoordinate → longitude or easting
        #   SensorYcoordinate → latitude  or northing
        raw_x = float(pkt.SensorXcoordinate)
        raw_y = float(pkt.SensorYcoordinate)

        if planar:
            # Store raw projected coords; caller must reproject
            lon, lat = raw_x, raw_y
        else:
            lon, lat = raw_x, raw_y

        # Flag pings with missing nav (common during GPS dropouts)
        if abs(lat) < _ZERO_COORD_THRESHOLD and abs(lon) < _ZERO_COORD_THRESHOLD:
            nav_missing_count += 1

        # ── Sample interval ──────────────────────────────────────
        # SlantRange and NumSamples come from the channel header.
        # A ping may have multiple channels (port + starboard);
        # we use the first channel's parameters.
        slant_range = 0.0
        num_samples = 0

        if hasattr(pkt, 'ping_chan_headers') and pkt.ping_chan_headers:
            ch = pkt.ping_chan_headers[0]
            slant_range = float(ch.SlantRange)
            num_samples = int(ch.NumSamples)
        elif hasattr(pkt, 'data') and pkt.data is not None:
            # Some pyxtf versions expose data directly
            # Try to get NumSamples from the ping-level attribute
            num_samples = int(getattr(pkt, 'NumSamples', 0))
            slant_range = float(getattr(pkt, 'SlantRange', 0.0))

        # Ground-range sample interval (metres per sample).
        # This is the across-track pixel size after slant-range
        # correction (flat-bottom assumption: altitude << range).
        if num_samples > 0 and slant_range > 0:
            sample_interval_m = slant_range / num_samples
        else:
            sample_interval_m = 0.0

        # ── Timestamp ────────────────────────────────────────────
        # pyxtf exposes Year/Month/Day/Hour/Minute/Second/HSeconds
        # or a TimeTag field (microseconds since midnight).
        timestamp_us = 0
        if hasattr(pkt, 'TimeTag'):
            timestamp_us = int(pkt.TimeTag)
        else:
            # Reconstruct from discrete fields
            h = int(getattr(pkt, 'Hour', 0))
            m = int(getattr(pkt, 'Minute', 0))
            s = int(getattr(pkt, 'Second', 0))
            hs = int(getattr(pkt, 'HSeconds', 0))
            timestamp_us = ((h * 3600 + m * 60 + s) * 1_000_000
                            + hs * 10_000)

        headers.append(PingGeoHeader(
            ping_index=int(getattr(pkt, 'PingNumber', len(headers))),
            timestamp_us=timestamp_us,
            latitude=lat,
            longitude=lon,
            heading_deg=float(getattr(pkt, 'SensorHeading', 0.0)),
            speed_kn=float(getattr(pkt, 'SensorSpeed', 0.0)),
            depth_m=float(getattr(pkt, 'SensorDepth', 0.0)),
            altitude_m=float(getattr(pkt, 'SensorPrimaryAltitude', 0.0)),
            samples_per_channel=num_samples,
            sample_interval_m=sample_interval_m,
        ))

    # Sort by ping index (some XTF writers don't guarantee order)
    headers.sort(key=lambda h: h.ping_index)

    if nav_missing_count > 0:
        pct = nav_missing_count / len(headers) * 100
        logger.warning(
            "%d / %d pings (%.1f%%) have zero coordinates (GPS dropout).",
            nav_missing_count, len(headers), pct,
        )

    logger.info(
        "Extracted %d ping headers.  "
        "Lat range: [%.6f, %.6f]  Lon range: [%.6f, %.6f]",
        len(headers),
        min(h.latitude for h in headers),
        max(h.latitude for h in headers),
        min(h.longitude for h in headers),
        max(h.longitude for h in headers),
    )

    return headers


# ── Along-track interpolation ────────────────────────────────────

def _interpolate_ping_position(
    fractional_ping: float,
    headers: list[PingGeoHeader],
) -> PingGeoHeader:
    """Linearly interpolate between the two bracketing ping headers.

    Parameters:
        fractional_ping: A (possibly non-integer) ping index.
        headers: Sorted list of PingGeoHeaders.

    Returns:
        A synthetic PingGeoHeader with interpolated lat/lon/heading.
    """
    if len(headers) == 0:
        raise ValueError("Cannot interpolate: empty header list.")

    if len(headers) == 1:
        return headers[0]

    # Clamp to range
    first_idx = headers[0].ping_index
    last_idx = headers[-1].ping_index
    fractional_ping = max(first_idx, min(last_idx, fractional_ping))

    # Binary-search for the bracketing pair
    lo, hi = 0, len(headers) - 1
    while lo < hi - 1:
        mid = (lo + hi) // 2
        if headers[mid].ping_index <= fractional_ping:
            lo = mid
        else:
            hi = mid

    h0 = headers[lo]
    h1 = headers[hi]

    # Interpolation fraction between h0 and h1
    span = h1.ping_index - h0.ping_index
    if span == 0:
        return h0
    t = (fractional_ping - h0.ping_index) / span

    # Linear interpolation of position
    lat = h0.latitude + t * (h1.latitude - h0.latitude)
    lon = h0.longitude + t * (h1.longitude - h0.longitude)

    # Heading interpolation needs circular handling
    # (e.g. interpolating between 350° and 10° should give 0°, not 180°)
    dh = h1.heading_deg - h0.heading_deg
    if dh > 180:
        dh -= 360
    elif dh < -180:
        dh += 360
    heading = (h0.heading_deg + t * dh) % 360

    return PingGeoHeader(
        ping_index=int(round(fractional_ping)),
        timestamp_us=int(h0.timestamp_us + t * (h1.timestamp_us - h0.timestamp_us)),
        latitude=lat,
        longitude=lon,
        heading_deg=heading,
        speed_kn=h0.speed_kn + t * (h1.speed_kn - h0.speed_kn),
        depth_m=h0.depth_m + t * (h1.depth_m - h0.depth_m),
        altitude_m=h0.altitude_m + t * (h1.altitude_m - h0.altitude_m),
        samples_per_channel=h0.samples_per_channel,
        sample_interval_m=h0.sample_interval_m,
    )


# ── Pixel → Geo coordinate mapping ──────────────────────────────

def bbox_pixel_to_geo(
    bbox: tuple[float, float, float, float],
    image_width: int,
    image_height: int,
    ping_headers: list[PingGeoHeader],
    ping_start: int,
    ping_end: int,
) -> GeoPoint:
    """Convert a bounding-box centre (pixels) to lat/lon.

    Geometry
    ────────
    A side-scan sonar mosaic tile maps to a rectangular strip of
    seabed.  The tile's two axes are:

        Y (rows, top→bottom) = along-track = successive pings
        X (cols, left→right) = across-track = port … nadir … starboard

    Step 1 – Along-track (Y → ping index):
        The tile spans pings [ping_start .. ping_end].
        The bbox centre row (cy) maps linearly:

            fractional_ping = ping_start + (cy / image_height)
                              × (ping_end − ping_start)

        We then interpolate between the two bracketing ping headers
        to get the towfish (lat, lon, heading) at that moment.

    Step 2 – Across-track (X → ground-range offset):
        The nadir (directly below the towfish) is at column
        image_width / 2.  The bbox centre column (cx) gives:

            offset_px   = cx − image_width / 2
            offset_m    = offset_px × sample_interval_m

        Positive offset = starboard; negative = port.

    Step 3 – Project offset onto WGS 84:
        The across-track direction is PERPENDICULAR to the towfish
        heading (bearing = heading + 90° for starboard):

            bearing_rad = radians(heading + 90°)
            Δlat = offset_m × cos(bearing_rad) / 111 320
            Δlon = offset_m × sin(bearing_rad) / (111 320 × cos(lat))

    Parameters:
        bbox: (x1, y1, x2, y2) in pixel coordinates.
        image_width: Tile width in pixels.
        image_height: Tile height in pixels.
        ping_headers: Sorted geo-headers for the pings covering this tile.
        ping_start: First ping index in this tile.
        ping_end: Last ping index in this tile.

    Returns:
        GeoPoint at the approximate centre of the detection.

    Raises:
        ValueError: If ping_headers is empty or parameters are invalid.
    """
    if not ping_headers:
        raise ValueError(
            "Geo-mapping requires at least one ping header."
        )

    if image_width <= 0 or image_height <= 0:
        raise ValueError(
            f"Invalid image dimensions: {image_width}×{image_height}"
        )

    if ping_start > ping_end:
        raise ValueError(
            f"ping_start ({ping_start}) > ping_end ({ping_end})"
        )

    x1, y1, x2, y2 = bbox
    cx = (x1 + x2) / 2.0
    cy = (y1 + y2) / 2.0

    # ── Step 1: Along-track → fractional ping index ──────────────
    if ping_end == ping_start:
        fractional_ping = float(ping_start)
    else:
        fractional_ping = ping_start + (cy / image_height) * (ping_end - ping_start)

    # Interpolate position at this fractional ping
    header = _interpolate_ping_position(fractional_ping, ping_headers)

    # ── Step 2: Across-track → ground-range offset (metres) ──────
    nadir_px = image_width / 2.0
    offset_px = cx - nadir_px  # +starboard, −port
    offset_m = offset_px * header.sample_interval_m

    # ── Step 3: Project offset onto WGS 84 ───────────────────────
    # The across-track direction is perpendicular to the heading.
    # heading = 0° (North) → across-track = 90° (East)
    # heading = 90° (East) → across-track = 180° (South)
    bearing_deg = header.heading_deg + 90.0
    bearing_rad = math.radians(bearing_deg)

    lat_rad = math.radians(header.latitude)
    cos_lat = math.cos(lat_rad)

    # Guard against division by zero at the poles
    if abs(cos_lat) < 1e-10:
        cos_lat = 1e-10

    d_lat = offset_m * math.cos(bearing_rad) / _M_PER_DEG
    d_lon = offset_m * math.sin(bearing_rad) / (_M_PER_DEG * cos_lat)

    return GeoPoint(
        latitude=header.latitude + d_lat,
        longitude=header.longitude + d_lon,
        depth_m=header.depth_m,
        altitude_m=header.altitude_m,
        ping_index=header.ping_index,
    )


def pixel_to_geo(
    ping_index: int,
    pixel_x: float,
    image_width: int,
    ping_headers: list[PingGeoHeader],
) -> GeoPoint:
    """Simplified single-point geolocation (no bbox, no tile height).

    Given a specific ping index and an across-track pixel position,
    compute the real-world coordinate.

    This is the function signature requested by the hackathon spec.

    Parameters:
        ping_index: The sonar ping corresponding to this point.
        pixel_x: Across-track pixel position (0 = port edge,
                 image_width = starboard edge).
        image_width: Total swath width in pixels.
        ping_headers: Sorted ping headers from the XTF file.

    Returns:
        GeoPoint with interpolated lat/lon.
    """
    if not ping_headers:
        raise ValueError("ping_headers list is empty.")

    # Interpolate along-track position
    header = _interpolate_ping_position(float(ping_index), ping_headers)

    # Across-track offset
    nadir_px = image_width / 2.0
    offset_px = pixel_x - nadir_px
    offset_m = offset_px * header.sample_interval_m

    # Project perpendicular to heading
    bearing_rad = math.radians(header.heading_deg + 90.0)
    lat_rad = math.radians(header.latitude)
    cos_lat = math.cos(lat_rad)
    if abs(cos_lat) < 1e-10:
        cos_lat = 1e-10

    d_lat = offset_m * math.cos(bearing_rad) / _M_PER_DEG
    d_lon = offset_m * math.sin(bearing_rad) / (_M_PER_DEG * cos_lat)

    return GeoPoint(
        latitude=header.latitude + d_lat,
        longitude=header.longitude + d_lon,
        depth_m=header.depth_m,
        altitude_m=header.altitude_m,
        ping_index=header.ping_index,
    )


# ── Tank / lab calibration detection ─────────────────────────────

def is_tank_calibration(ping_headers: list[PingGeoHeader]) -> bool:
    """Detect if a session is a tank/lab calibration (no real GPS).

    Heuristics:
        1. All pings have identical coordinates (typically 0, 0).
        2. Total track distance is < 1 metre.
        3. All coordinates are exactly zero (GNSS never acquired).

    Returns:
        True if this appears to be a tank calibration.
    """
    if not ping_headers:
        return True

    lats = [h.latitude for h in ping_headers]
    lons = [h.longitude for h in ping_headers]

    # All exactly zero
    if all(abs(lat) < _ZERO_COORD_THRESHOLD for lat in lats) and \
       all(abs(lon) < _ZERO_COORD_THRESHOLD for lon in lons):
        return True

    # All identical
    if len(set(lats)) <= 1 and len(set(lons)) <= 1:
        return True

    # Movement < 1 metre
    lat_range = max(lats) - min(lats)
    lon_range = max(lons) - min(lons)
    mean_lat = sum(lats) / len(lats)
    cos_lat = math.cos(math.radians(mean_lat)) if abs(mean_lat) < 90 else 1e-10

    d_north = lat_range * _M_PER_DEG
    d_east = lon_range * _M_PER_DEG * cos_lat
    total_m = math.sqrt(d_north ** 2 + d_east ** 2)

    return total_m < 1.0


# ── Convenience: parse_ping_headers (alias for infer.py) ─────────

def parse_ping_headers(log_path: str | Path) -> list[PingGeoHeader]:
    """Alias for extract_ping_geo_headers.

    Provided for API compatibility with the function signature
    requested in the hackathon spec.
    """
    return extract_ping_geo_headers(log_path)
