"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Crosshair, Eraser, Layers, Loader2, MapPin, Plus, Sparkles, Trash2 } from "lucide-react";

const PK_CENTER = { lat: 30.4, lng: 70.3 }; // geographic centre of Pakistan
type LngLat = [number, number];
type MapType = "hybrid" | "satellite" | "roadmap" | "terrain";

declare global {
  interface Window {
    google?: any;
  }
}

export function FarmMap({
  apiKey,
  onPolygon
}: {
  apiKey: string;
  onPolygon: (polygon: LngLat[] | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const polygonRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const clickListenerRef = useRef<any>(null);

  const [sdkReady, setSdkReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(true);
  const [points, setPoints] = useState<LngLat[]>([]);
  const [locating, setLocating] = useState(false);
  const [mapType, setMapType] = useState<MapType>("hybrid");

  // Init map once SDK is ready
  useEffect(() => {
    if (!sdkReady || !containerRef.current || mapRef.current) return;
    const g = window.google;
    if (!g?.maps) return;

    try {
      const map = new g.maps.Map(containerRef.current, {
        center: PK_CENTER,
        zoom: 5,
        mapTypeId: mapType,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: false,
        clickableIcons: false,
        backgroundColor: "#0A0A0F",
        gestureHandling: "greedy",
        tilt: 0
      });
      mapRef.current = map;

      clickListenerRef.current = map.addListener("click", (e: any) => {
        if (!drawingRef.current) return;
        if (!e?.latLng) return;
        const lngLat: LngLat = [e.latLng.lng(), e.latLng.lat()];
        setPoints((p) => [...p, lngLat]);
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("Google Maps init failed", e);
      setInitError(msg);
    }

    return () => {
      try {
        clickListenerRef.current?.remove();
      } catch {}
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkReady]);

  // Keep drawing state accessible inside the (one-shot) click listener
  const drawingRef = useRef(drawing);
  useEffect(() => {
    drawingRef.current = drawing;
  }, [drawing]);

  // Render markers + polygon whenever points change
  useEffect(() => {
    const g = window.google;
    const map = mapRef.current;
    if (!g?.maps || !map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => {
      try {
        m.setMap(null);
      } catch {}
    });
    markersRef.current = [];

    points.forEach((p, i) => {
      const marker = new g.maps.Marker({
        position: { lng: p[0], lat: p[1] },
        map,
        title: `Vertex ${i + 1}`,
        icon: {
          path: g.maps.SymbolPath.CIRCLE,
          fillColor: "#FFD600",
          fillOpacity: 1,
          strokeColor: "#000000",
          strokeWeight: 2,
          scale: 6
        }
      });
      markersRef.current.push(marker);
    });

    // Clear previous polygon
    if (polygonRef.current) {
      try {
        polygonRef.current.setMap(null);
      } catch {}
      polygonRef.current = null;
    }

    if (points.length >= 2) {
      const path = points.map((p) => ({ lng: p[0], lat: p[1] }));
      polygonRef.current = new g.maps.Polygon({
        paths: path,
        strokeColor: "#FFD600",
        strokeOpacity: 0.95,
        strokeWeight: 2,
        fillColor: "#FFD600",
        fillOpacity: 0.12,
        map,
        clickable: false
      });
    }
  }, [points]);

  // React to map-type toggles
  useEffect(() => {
    if (mapRef.current?.setMapTypeId) {
      try {
        mapRef.current.setMapTypeId(mapType);
      } catch {}
    }
  }, [mapType]);

  function clearAll() {
    setPoints([]);
    setDrawing(true);
    onPolygon(null);
  }

  function commit() {
    if (points.length < 3) return;
    setDrawing(false);
    onPolygon(points);
  }

  function locateMe() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        mapRef.current?.panTo({ lng: longitude, lat: latitude });
        mapRef.current?.setZoom(17);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function jumpTo(lat: number, lng: number) {
    if (!isValidCoord(lat, lng)) return false;
    mapRef.current?.panTo({ lng, lat });
    mapRef.current?.setZoom(17);
    return true;
  }

  function addVertex(lat: number, lng: number) {
    if (!isValidCoord(lat, lng)) return false;
    setPoints((p) => [...p, [lng, lat] as LngLat]);
    mapRef.current?.panTo({ lng, lat });
    if ((mapRef.current?.getZoom?.() ?? 5) < 12) {
      mapRef.current?.setZoom(15);
    }
    return true;
  }

  function removeVertex(idx: number) {
    setPoints((p) => p.filter((_, i) => i !== idx));
  }

  const trimmedKey = (apiKey || "").trim();
  const scriptSrc = trimmedKey
    ? `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
        trimmedKey
      )}&v=weekly&loading=async`
    : "";

  return (
    <>
      {trimmedKey && (
        <Script
          src={scriptSrc}
          strategy="afterInteractive"
          onLoad={() => setSdkReady(true)}
          onError={() => setInitError("Failed to load Google Maps SDK")}
        />
      )}
      <div className="relative card-elevated overflow-hidden">
        <div
          ref={containerRef}
          className="w-full h-[560px]"
          style={{ background: "#0A0A0F" }}
        />

        {!sdkReady && !initError && trimmedKey && (
          <div className="absolute inset-0 grid place-items-center text-ink-dim pointer-events-none">
            <Loader2 className="size-6 animate-spin" />
          </div>
        )}

        {!trimmedKey && (
          <div className="absolute inset-4 grid place-items-center">
            <div className="card border border-yellow-400/30 bg-yellow-400/5 p-5 text-sm max-w-lg">
              <p className="text-yellow-200 font-medium">
                Google Maps API key missing
              </p>
              <p
                dir="rtl"
                lang="ur"
                className="text-ink-muted text-xs mt-1"
              >
                گوگل میپس کی کلید موجود نہیں
              </p>
              <p className="text-ink-muted text-xs mt-3 leading-relaxed">
                Set <code className="font-mono text-ink">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>
                {" "}in your Vercel project settings (or in a local{" "}
                <code className="font-mono text-ink">.env</code>).
              </p>
              <ol className="mt-3 list-decimal list-inside text-[11px] text-ink-dim space-y-1">
                <li>
                  Vercel · Project · Settings · Environment Variables → add
                  <code className="font-mono text-ink mx-1">
                    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                  </code>
                  with your key.
                </li>
                <li>Redeploy the project so the value is baked in.</li>
                <li>
                  In Google Cloud, allow your Vercel domain (e.g.
                  <code className="font-mono text-ink mx-1">
                    *.vercel.app
                  </code>
                  and your custom domain) under <em>Application restrictions</em>.
                </li>
              </ol>
            </div>
          </div>
        )}

        {initError && (
          <div className="absolute inset-4 grid place-items-center">
            <div className="card border border-red-400/30 bg-red-400/5 p-4 text-sm max-w-md text-center">
              <p className="text-red-300 font-medium">Map failed to initialise</p>
              <p className="text-ink-muted text-xs mt-1">{initError}</p>
              <p className="text-ink-dim text-[11px] mt-2">
                Common causes: invalid key, domain not whitelisted in Google Cloud,
                or the Maps JavaScript API isn't enabled on the key's project.
              </p>
            </div>
          </div>
        )}

        {/* Floating toolbar */}
{/* (toolbar continues below) */}
        <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2 justify-between pointer-events-none">
          <div className="pointer-events-auto glass rounded-pill px-3 py-2 text-xs text-ink-muted">
            {drawing ? (
              <>
                <span className="text-field font-medium">●</span>{" "}
                Tap on the map to add vertices · {points.length} added
              </>
            ) : (
              <>
                <span className="text-emerald-400">●</span> Field saved ·{" "}
                {points.length} vertices
              </>
            )}
          </div>
          <div className="pointer-events-auto flex items-center gap-2">
            <MapTypeToggle value={mapType} onChange={setMapType} />
            <button
              onClick={locateMe}
              className="glass rounded-pill px-3 py-2 text-xs hover:bg-white/10 transition inline-flex items-center gap-1.5"
              title="Use my location"
            >
              {locating ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Crosshair className="size-3.5" />
              )}
              Locate
            </button>
            <button
              onClick={clearAll}
              className="glass rounded-pill px-3 py-2 text-xs hover:bg-white/10 transition inline-flex items-center gap-1.5"
              title="Reset polygon"
            >
              <Eraser className="size-3.5" />
              Reset
            </button>
            <button
              onClick={commit}
              disabled={points.length < 3 || !drawing}
              className="rounded-pill px-3 py-2 text-xs bg-gradient-to-r from-accent to-accent-glow text-black font-medium disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
            >
              <Sparkles className="size-3.5" />
              Analyse field
            </button>
          </div>
        </div>
      </div>

      {/* Coordinate entry panel */}
      <CoordinatePanel
        points={points}
        onJump={jumpTo}
        onAdd={addVertex}
        onRemove={removeVertex}
        onClearAll={clearAll}
        onCommit={commit}
        drawing={drawing}
      />
    </>
  );
}

function CoordinatePanel({
  points,
  onJump,
  onAdd,
  onRemove,
  onClearAll,
  onCommit,
  drawing
}: {
  points: LngLat[];
  onJump: (lat: number, lng: number) => boolean;
  onAdd: (lat: number, lng: number) => boolean;
  onRemove: (idx: number) => void;
  onClearAll: () => void;
  onCommit: () => void;
  drawing: boolean;
}) {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; msg: string } | null>(
    null
  );

  function parseInputs(): { lat: number; lng: number } | null {
    const la = parseFloat(lat);
    const ln = parseFloat(lng);
    if (!isValidCoord(la, ln)) {
      setFeedback({
        kind: "err",
        msg: "Enter valid coordinates · صحیح مقامات درج کریں (lat −90..90, lng −180..180)"
      });
      return null;
    }
    return { lat: la, lng: ln };
  }

  function handleJump() {
    const p = parseInputs();
    if (!p) return;
    if (onJump(p.lat, p.lng)) {
      setFeedback({
        kind: "ok",
        msg: `Map centred on ${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`
      });
    }
  }

  function handleAdd() {
    const p = parseInputs();
    if (!p) return;
    if (onAdd(p.lat, p.lng)) {
      setFeedback({
        kind: "ok",
        msg: `Vertex added · نشان شامل ہو گیا (${p.lat.toFixed(5)}, ${p.lng.toFixed(5)})`
      });
      setLat("");
      setLng("");
    }
  }

  return (
    <div className="mt-4 card p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <MapPin className="size-4 text-field" />
            Enter coordinates
            <span dir="rtl" lang="ur" className="ms-1 text-ink-muted text-xs font-normal">
              · مقامات درج کریں
            </span>
          </h3>
          <p className="text-xs text-ink-dim mt-1 leading-relaxed">
            Type latitude and longitude (from a GPS device, survey paper, or
            phone). Use "Go to" to centre the map, or "Add vertex" to push the
            point onto your polygon.
          </p>
          <p
            dir="rtl"
            lang="ur"
            className="text-[11px] text-ink-dim mt-1 leading-loose"
          >
            اپنے GPS یا سروے سے عرض البلد اور طول البلد لکھیں۔ "Go to" سے نقشہ
            وہاں جائے گا، "Add vertex" سے کھیت کے کونے میں اضافہ ہو گا۔
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-12 gap-3 items-end">
        <label className="sm:col-span-4">
          <span className="text-[10px] uppercase tracking-wider text-ink-dim">
            Latitude
            <span dir="rtl" lang="ur" className="ms-1 normal-case tracking-normal">
              · عرض البلد
            </span>
          </span>
          <input
            type="number"
            step="0.000001"
            inputMode="decimal"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="e.g. 31.5497"
            className="mt-1 w-full bg-bg-elevated border border-line rounded-md px-3 py-2 text-sm font-mono text-ink focus:outline-none focus:border-accent/60"
          />
        </label>
        <label className="sm:col-span-4">
          <span className="text-[10px] uppercase tracking-wider text-ink-dim">
            Longitude
            <span dir="rtl" lang="ur" className="ms-1 normal-case tracking-normal">
              · طول البلد
            </span>
          </span>
          <input
            type="number"
            step="0.000001"
            inputMode="decimal"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="e.g. 74.3436"
            className="mt-1 w-full bg-bg-elevated border border-line rounded-md px-3 py-2 text-sm font-mono text-ink focus:outline-none focus:border-accent/60"
          />
        </label>
        <div className="sm:col-span-4 flex gap-2">
          <button
            onClick={handleJump}
            className="flex-1 rounded-pill px-3 py-2 text-xs border border-line text-ink hover:bg-white/5 transition inline-flex items-center justify-center gap-1.5"
          >
            <Crosshair className="size-3.5" />
            Go to
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 rounded-pill px-3 py-2 text-xs bg-gradient-to-r from-accent to-accent-glow text-black font-medium hover:brightness-110 transition inline-flex items-center justify-center gap-1.5"
          >
            <Plus className="size-3.5" />
            Add vertex
          </button>
        </div>
      </div>

      {feedback && (
        <p
          className={`mt-3 text-[11px] ${
            feedback.kind === "ok" ? "text-emerald-300" : "text-red-300"
          }`}
        >
          {feedback.msg}
        </p>
      )}

      {/* Vertex list */}
      {points.length > 0 && (
        <div className="mt-5 border-t border-line pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-wider text-ink-dim">
              Polygon vertices ({points.length})
              <span dir="rtl" lang="ur" className="ms-2 normal-case tracking-normal">
                · کھیت کے کونے
              </span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClearAll}
                className="text-[11px] text-ink-dim hover:text-red-300 inline-flex items-center gap-1"
              >
                <Trash2 className="size-3" />
                Reset all
              </button>
              {drawing && points.length >= 3 && (
                <button
                  onClick={onCommit}
                  className="text-[11px] text-accent-glow hover:text-accent inline-flex items-center gap-1"
                >
                  <Sparkles className="size-3" />
                  Analyse field
                </button>
              )}
            </div>
          </div>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px] font-mono">
            {points.map((p, i) => (
              <li
                key={i}
                className="card-elevated rounded-md px-3 py-2 flex items-center justify-between gap-2"
              >
                <span className="flex items-center gap-2">
                  <span className="size-4 grid place-items-center rounded-full bg-field/20 text-field text-[9px] font-semibold font-sans">
                    {i + 1}
                  </span>
                  <span className="text-ink">
                    {p[1].toFixed(5)}, {p[0].toFixed(5)}
                  </span>
                </span>
                <button
                  onClick={() => onRemove(i)}
                  className="text-ink-dim hover:text-red-300"
                  aria-label="Remove vertex"
                >
                  <Trash2 className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function isValidCoord(lat: number, lng: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

function MapTypeToggle({
  value,
  onChange
}: {
  value: MapType;
  onChange: (m: MapType) => void;
}) {
  const types: { id: MapType; label: string }[] = [
    { id: "hybrid", label: "Hybrid" },
    { id: "satellite", label: "Satellite" },
    { id: "roadmap", label: "Road" }
  ];
  return (
    <div className="glass rounded-pill p-0.5 flex items-center gap-0.5">
      <Layers className="size-3.5 text-ink-dim ms-2 me-1" />
      {types.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`rounded-pill px-2.5 py-1 text-[11px] transition ${
            value === t.id
              ? "bg-white/15 text-ink"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
