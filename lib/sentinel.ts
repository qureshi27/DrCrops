import "server-only";

const AUTH_URL = "https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token";
const PROCESS_URL = "https://services.sentinel-hub.com/api/v1/process";
const STATS_URL = "https://services.sentinel-hub.com/api/v1/statistics";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token;
  }
  const id = process.env.SENTINEL_HUB_CLIENT_ID?.trim().replace(/^"|"$/g, "");
  const secret = process.env.SENTINEL_HUB_CLIENT_SECRET?.trim().replace(/^"|"$/g, "");
  if (!id || !secret) throw new Error("Sentinel Hub credentials missing");

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: id,
    client_secret: secret
  });

  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!res.ok) throw new Error(`Sentinel auth failed: ${res.status}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000
  };
  return cachedToken.token;
}

export type Polygon = number[][]; // [[lng, lat], ...]

const NDVI_EVALSCRIPT = `//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04","B08","dataMask"], units: "REFLECTANCE" }],
    output: { bands: 4 }
  };
}
function colorRamp(v){
  if (v < 0)   return [0.42,0.12,0.12];
  if (v < 0.2) return [0.84,0.42,0.23];
  if (v < 0.4) return [0.94,0.83,0.29];
  if (v < 0.6) return [0.45,0.78,0.36];
  if (v < 0.8) return [0.17,0.83,0.48];
  return [0.04,0.62,0.34];
}
function evaluatePixel(s){
  const ndvi = (s.B08 - s.B04) / (s.B08 + s.B04);
  const c = colorRamp(ndvi);
  return [c[0], c[1], c[2], s.dataMask];
}`;

export async function ndviImage(params: {
  polygon: Polygon;
  from: string; // ISO
  to: string;   // ISO
  width?: number;
  height?: number;
}): Promise<Buffer> {
  const token = await getToken();

  const payload = {
    input: {
      bounds: {
        geometry: {
          type: "Polygon",
          coordinates: [params.polygon]
        },
        properties: { crs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84" }
      },
      data: [
        {
          type: "sentinel-2-l2a",
          dataFilter: {
            timeRange: { from: params.from, to: params.to },
            maxCloudCoverage: 30
          }
        }
      ]
    },
    output: {
      width: params.width ?? 512,
      height: params.height ?? 512,
      responses: [{ identifier: "default", format: { type: "image/png" } }]
    },
    evalscript: NDVI_EVALSCRIPT
  };

  const res = await fetch(PROCESS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "image/png"
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Sentinel process ${res.status}: ${t.slice(0, 400)}`);
  }
  const buf = await res.arrayBuffer();
  return Buffer.from(buf);
}

const STATS_EVALSCRIPT = `//VERSION=3
function setup(){
  return {
    input: [{ bands:["B04","B08","dataMask"] }],
    output: [
      { id: "ndvi", bands: 1, sampleType: "FLOAT32" },
      { id: "dataMask", bands: 1 }
    ]
  };
}
function evaluatePixel(s){
  const ndvi = (s.B08 - s.B04) / (s.B08 + s.B04);
  return { ndvi: [ndvi], dataMask: [s.dataMask] };
}`;

export async function ndviStats(params: {
  polygon: Polygon;
  from: string;
  to: string;
}): Promise<{ date: string; mean: number; stDev: number }[]> {
  const token = await getToken();
  const payload = {
    input: {
      bounds: {
        geometry: { type: "Polygon", coordinates: [params.polygon] },
        properties: { crs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84" }
      },
      data: [
        {
          type: "sentinel-2-l2a",
          dataFilter: { mosaickingOrder: "leastCC", maxCloudCoverage: 40 }
        }
      ]
    },
    aggregation: {
      timeRange: { from: params.from, to: params.to },
      aggregationInterval: { of: "P10D" },
      evalscript: STATS_EVALSCRIPT,
      resx: 10,
      resy: 10
    },
    calculations: { ndvi: { statistics: { default: {} } } }
  };

  const res = await fetch(STATS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Sentinel stats ${res.status}: ${t.slice(0, 400)}`);
  }
  const json = (await res.json()) as {
    data: { interval: { from: string }; outputs: { ndvi: { bands: { B0: { stats: { mean: number; stDev: number } } } } } }[];
  };
  return (json.data ?? []).map((d) => ({
    date: d.interval.from.slice(0, 10),
    mean: d.outputs.ndvi.bands.B0.stats.mean,
    stDev: d.outputs.ndvi.bands.B0.stats.stDev
  }));
}
