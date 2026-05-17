"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Cloud,
  CloudRain,
  Crosshair,
  Droplets,
  Loader2,
  MapPin,
  Sparkles,
  Sun,
  Wind
} from "lucide-react";

const CITIES = [
  { name: "Lahore", lat: 31.5497, lon: 74.3436 },
  { name: "Karachi", lat: 24.8607, lon: 67.0011 },
  { name: "Faisalabad", lat: 31.4504, lon: 73.135 },
  { name: "Multan", lat: 30.1575, lon: 71.5249 },
  { name: "Hyderabad", lat: 25.396, lon: 68.3578 },
  { name: "Peshawar", lat: 34.0151, lon: 71.5249 }
];

type Weather = {
  current?: {
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    weather_code: number[];
  };
};

export default function WeatherPage() {
  const [city, setCity] = useState(CITIES[0]);
  const [data, setData] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/weather?lat=${city.lat}&lon=${city.lon}`);
        if (!res.ok) throw new Error(`weather ${res.status}`);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) {
          console.error("weather fetch failed", err);
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [city]);

  function locateMe() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setCity({
        name: "My location",
        lat: pos.coords.latitude,
        lon: pos.coords.longitude
      });
    });
  }

  const current = data?.current;
  const daily = data?.daily;

  // Spray advisor: best window = low precip prob, wind < 15 km/h
  const sprayWindow = (() => {
    if (!daily) return null;
    for (let i = 0; i < daily.time.length; i++) {
      if (
        (daily.precipitation_probability_max[i] ?? 100) < 30 &&
        (daily.wind_speed_10m_max[i] ?? 100) < 15
      ) {
        return { date: daily.time[i], idx: i };
      }
    }
    return null;
  })();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-end justify-between gap-6 flex-wrap"
      >
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-ink-dim">
            Weather
            <span dir="rtl" lang="ur" className="ms-2 normal-case tracking-normal">
              · موسم
            </span>
          </p>
          <h1 className="mt-2 text-4xl font-bold text-gradient">
            7-day forecast & spray advisor
          </h1>
          <p dir="rtl" lang="ur" className="mt-2 text-xl text-ink-muted">
            سات دن کا موسم اور سپرے کا بہترین وقت
          </p>
          <p className="mt-2 text-ink-muted max-w-2xl">
            Plan irrigation, harvest and spraying with hyper-local weather.
          </p>
          <p
            dir="rtl"
            lang="ur"
            className="mt-1 text-sm text-ink-dim leading-loose"
          >
            پانی دینے، کٹائی اور سپرے کا منصوبہ مقامی موسم کے مطابق بنائیں۔
          </p>
        </div>
        <button
          onClick={locateMe}
          className="rounded-pill px-4 py-2 text-sm border border-line hover:bg-white/5 inline-flex items-center gap-1.5"
        >
          <Crosshair className="size-4" />
          Use my location
        </button>
      </motion.div>

      <div className="flex flex-wrap gap-2 mb-6">
        {CITIES.map((c) => (
          <button
            key={c.name}
            onClick={() => setCity(c)}
            className={`rounded-pill px-3 py-1.5 text-xs border transition inline-flex items-center gap-1.5 ${
              city.name === c.name
                ? "border-accent/60 bg-accent/10 text-ink"
                : "border-line text-ink-muted hover:bg-white/5"
            }`}
          >
            <MapPin className="size-3" />
            {c.name}
          </button>
        ))}
      </div>

      {loading && (
        <div className="card-elevated p-10 text-center">
          <Loader2 className="size-6 mx-auto animate-spin text-accent-glow" />
        </div>
      )}

      {current && !loading && (
        <div className="grid lg:grid-cols-12 gap-6 mb-6">
          <div className="lg:col-span-5 card p-6">
            <p className="text-xs uppercase tracking-wider text-ink-dim">
              {city.name} · now
            </p>
            <div className="mt-4 flex items-center gap-6">
              <div className="text-6xl font-mono">{Math.round(current.temperature_2m)}°</div>
              <div className="text-ink-muted text-sm space-y-1">
                <p className="inline-flex items-center gap-2">
                  <Droplets className="size-4 text-accent-glow" />
                  {current.relative_humidity_2m}% humidity
                </p>
                <p className="inline-flex items-center gap-2">
                  <Wind className="size-4 text-field" />
                  {current.wind_speed_10m.toFixed(0)} km/h
                </p>
                <p className="inline-flex items-center gap-2">
                  <CloudRain className="size-4 text-accent" />
                  {current.precipitation} mm rain
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 card-elevated p-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="size-4 text-field" />
              <h3 className="font-semibold">
                Best spray window
                <span dir="rtl" lang="ur" className="ms-2 text-ink-muted text-xs font-normal">
                  · سپرے کا بہترین وقت
                </span>
              </h3>
            </div>
            {sprayWindow ? (
              <>
                <p className="text-2xl font-semibold mt-2">
                  {new Date(sprayWindow.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "short",
                    day: "numeric"
                  })}
                </p>
                <p className="text-sm text-ink-muted mt-2">
                  Low rain risk (
                  {daily!.precipitation_probability_max[sprayWindow.idx]}%) and
                  calm wind ({daily!.wind_speed_10m_max[sprayWindow.idx].toFixed(0)} km/h max).
                </p>
              </>
            ) : (
              <p className="text-sm text-ink-muted mt-2">
                No ideal spray window in the next 7 days. Monitor wind and rain forecasts.
              </p>
            )}
          </div>
        </div>
      )}

      {daily && (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-7 divide-x divide-line">
            {daily.time.map((t, i) => (
              <div
                key={t}
                className="p-4 text-center hover:bg-white/5 transition"
              >
                <p className="text-xs text-ink-dim">
                  {new Date(t).toLocaleDateString(undefined, { weekday: "short" })}
                </p>
                <div className="my-2 flex justify-center">
                  {weatherIcon(daily.weather_code[i])}
                </div>
                <p className="text-sm font-mono">
                  <span className="text-ink">{Math.round(daily.temperature_2m_max[i])}°</span>{" "}
                  <span className="text-ink-dim">{Math.round(daily.temperature_2m_min[i])}°</span>
                </p>
                <p className="text-[11px] text-accent-glow mt-1">
                  {daily.precipitation_probability_max[i]}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function weatherIcon(code: number) {
  if ([0, 1].includes(code)) return <Sun className="size-6 text-field" />;
  if ([2, 3].includes(code)) return <Cloud className="size-6 text-ink-muted" />;
  if (code >= 51 && code <= 67) return <CloudRain className="size-6 text-accent-glow" />;
  if (code >= 71 && code <= 86) return <CloudRain className="size-6 text-accent" />;
  return <Cloud className="size-6 text-ink-muted" />;
}
