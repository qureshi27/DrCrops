"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Crosshair, Eraser, Layers, Loader2, Sparkles } from "lucide-react";

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

  const scriptSrc = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
    apiKey
  )}&v=weekly&loading=async`;

  return (
    <>
      <Script
        src={scriptSrc}
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
        onError={() => setInitError("Failed to load Google Maps SDK")}
      />
      <div className="relative card-elevated overflow-hidden">
        <div
          ref={containerRef}
          className="w-full h-[560px]"
          style={{ background: "#0A0A0F" }}
        />

        {!sdkReady && !initError && (
          <div className="absolute inset-0 grid place-items-center text-ink-dim pointer-events-none">
            <Loader2 className="size-6 animate-spin" />
          </div>
        )}

        {initError && (
          <div className="absolute inset-4 grid place-items-center">
            <div className="card border border-red-400/30 bg-red-400/5 p-4 text-sm max-w-md text-center">
              <p className="text-red-300 font-medium">Map failed to initialise</p>
              <p className="text-ink-muted text-xs mt-1">{initError}</p>
              <p className="text-ink-dim text-[11px] mt-2">
                Check that <code className="font-mono">VITE_GOOGLE_MAPS_API_KEY</code>
                {" "}(or <code className="font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>)
                is set in your <code className="font-mono">.env</code>.
              </p>
            </div>
          </div>
        )}

        {/* Floating toolbar */}
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
    </>
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
