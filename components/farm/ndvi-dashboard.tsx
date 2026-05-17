"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine
} from "recharts";
import { Activity, Droplets, Loader2, Sprout, TrendingDown, TrendingUp } from "lucide-react";

type Stat = { date: string; mean: number; stDev: number };

export function NDVIDashboard({
  polygon
}: {
  polygon: number[][] | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<Stat[] | null>(null);

  useEffect(() => {
    if (!polygon) {
      setImageDataUrl(null);
      setStats(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/ndvi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ polygon, mode: "both" })
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.error ?? "NDVI fetch failed");
        }
        if (!cancelled) {
          setImageDataUrl(json.imageDataUrl ?? null);
          setStats((json.stats as Stat[]) ?? []);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [polygon]);

  if (!polygon) {
    return (
      <div className="card-elevated p-10 text-center">
        <Sprout className="size-10 mx-auto text-field/70" />
        <h3 className="mt-4 text-xl font-semibold">Draw a field to begin</h3>
        <p className="mt-2 text-sm text-ink-muted max-w-md mx-auto">
          Tap on the map to outline your plot. We'll fetch Sentinel-2 satellite imagery
          and show vegetation health (NDVI) over the last four months.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card-elevated p-10 text-center">
        <Loader2 className="size-8 mx-auto animate-spin text-accent-glow" />
        <p className="mt-4 text-ink-muted">Fetching satellite data from Sentinel Hub…</p>
        <p className="text-xs text-ink-dim mt-1">This usually takes 5–15 seconds.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border border-red-400/30 bg-red-400/5 p-6">
        <p className="text-red-300 font-medium">Couldn't load NDVI data</p>
        <p className="text-ink-muted text-sm mt-1">{error}</p>
      </div>
    );
  }

  const lastStat = stats?.[stats.length - 1];
  const firstStat = stats?.[0];
  const trend =
    lastStat && firstStat
      ? lastStat.mean - firstStat.mean
      : 0;

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-12 gap-6">
        {/* NDVI image */}
        <div className="lg:col-span-7 card-elevated overflow-hidden relative">
          {imageDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageDataUrl}
              alt="NDVI"
              className="w-full h-auto block field-outline"
            />
          ) : (
            <div className="p-8 text-ink-dim">No imagery available</div>
          )}
          <div className="absolute top-3 left-3 glass rounded-md px-3 py-1.5 text-[11px]">
            <p className="text-ink-dim">Sentinel-2 · NDVI composite</p>
          </div>
          <div className="absolute bottom-3 right-3 glass rounded-md px-3 py-2 text-[10px] text-ink-muted">
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-24 h-1.5 rounded"
                style={{
                  background:
                    "linear-gradient(90deg,#6b1e1e 0%,#d76b3a 25%,#f0d34a 50%,#73c75c 75%,#0a9e57 100%)"
                }}
              />
              <span>0 → 1</span>
            </div>
          </div>
        </div>

        {/* Stat tiles */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          <StatTile
            label="Current NDVI"
            value={lastStat ? lastStat.mean.toFixed(2) : "—"}
            sub={lastStat?.date}
            icon={<Activity className="size-4 text-accent-glow" />}
          />
          <StatTile
            label="Trend"
            value={`${trend >= 0 ? "+" : ""}${trend.toFixed(2)}`}
            sub={firstStat ? `since ${firstStat.date}` : ""}
            icon={
              trend >= 0 ? (
                <TrendingUp className="size-4 text-emerald-400" />
              ) : (
                <TrendingDown className="size-4 text-orange-400" />
              )
            }
            valueClass={trend >= 0 ? "text-emerald-400" : "text-orange-400"}
          />
          <StatTile
            label="Variability"
            value={lastStat ? lastStat.stDev.toFixed(2) : "—"}
            sub="std-dev across pixels"
            icon={<Droplets className="size-4 text-field" />}
          />
          <StatTile
            label="Status"
            value={
              !lastStat
                ? "—"
                : lastStat.mean > 0.6
                ? "Healthy"
                : lastStat.mean > 0.4
                ? "Moderate"
                : lastStat.mean > 0.2
                ? "Stressed"
                : "Bare/early"
            }
            sub="vs typical thresholds"
            icon={<Sprout className="size-4 text-emerald-400" />}
          />
        </div>
      </div>

      {/* Time series */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm uppercase tracking-[0.2em] text-ink-dim">
              NDVI time series
            </h3>
            <p className="text-xs text-ink-dim mt-1">
              10-day intervals · least-cloud mosaic per window
            </p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats ?? []} margin={{ left: -10, right: 16 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="date"
                stroke="#6B6B7A"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="#6B6B7A"
                fontSize={11}
                domain={[0, 1]}
                tickLine={false}
              />
              <ReferenceLine
                y={0.6}
                stroke="#FFD600"
                strokeDasharray="3 3"
                label={{
                  value: "Healthy threshold",
                  fill: "#FFD600",
                  fontSize: 10,
                  position: "insideTopRight"
                }}
              />
              <Tooltip
                contentStyle={{
                  background: "#13131A",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  fontSize: 12
                }}
                labelStyle={{ color: "#B4B4BE" }}
                itemStyle={{ color: "#00D4FF" }}
                formatter={(v: number) => v.toFixed(3)}
              />
              <Line
                type="monotone"
                dataKey="mean"
                stroke="#00D4FF"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#00D4FF" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
  icon,
  valueClass
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="card-elevated p-4">
      <div className="flex items-center gap-2 text-xs text-ink-dim">
        {icon}
        <span className="uppercase tracking-wider">{label}</span>
      </div>
      <p className={`mt-2 text-2xl font-mono ${valueClass ?? "text-ink"}`}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-ink-dim mt-1">{sub}</p>}
    </div>
  );
}
