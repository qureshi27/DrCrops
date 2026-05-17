"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Satellite } from "lucide-react";

export function PakistanMapPreview() {
  const features: { en: string; ur: string }[] = [
    { en: "NDVI · vegetation health", ur: "این ڈی وی آئی · فصل کی صحت" },
    { en: "NDWI · water stress", ur: "این ڈی ڈبلیو آئی · پانی کی کمی" },
    { en: "True-colour imagery, 5-day refresh", ur: "ہر 5 دن کی نئی تصاویر" },
    { en: "Compare against regional baseline", ur: "علاقائی اوسط سے موازنہ" }
  ];

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24">
      <div className="card-elevated rounded-lg overflow-hidden relative">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="grid lg:grid-cols-2">
          <div className="p-10 lg:p-14 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-pill px-3 py-1 text-xs bg-field/10 text-field border border-field/30">
              <Satellite className="size-3" />
              Sentinel-2 · 10m resolution
            </div>
            <h2 className="mt-5 text-h2 text-gradient">
              Satellite intelligence on your fields
            </h2>
            <p dir="rtl" lang="ur" className="mt-2 text-xl text-ink-muted">
              آپ کے کھیتوں پر سیٹلائٹ کی نظر
            </p>
            <p className="mt-4 text-ink-muted leading-relaxed max-w-md">
              Draw your plot and we'll fetch Sentinel-2 NDVI — the same data
              agronomists use, free for every farmer.
            </p>
            <p
              dir="rtl"
              lang="ur"
              className="mt-2 text-sm text-ink-dim leading-loose max-w-md"
            >
              اپنا کھیت نشان زد کریں اور سیٹلائٹ سے فصل کی صحت دیکھیں — ہر کسان کے لیے مفت۔
            </p>

            <ul className="mt-8 space-y-3 text-sm">
              {features.map((f) => (
                <li key={f.en} className="flex items-center gap-3 text-ink-muted">
                  <span className="size-1.5 rounded-full bg-field" />
                  <span>{f.en}</span>
                  <span
                    dir="rtl"
                    lang="ur"
                    className="text-[12px] text-ink-dim"
                  >
                    · {f.ur}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/farm"
              className="mt-10 inline-flex items-baseline gap-2 rounded-pill px-6 py-3 text-sm border border-field/60 text-ink hover:bg-field/10 hover:border-field transition"
            >
              <span>Open My Farm</span>
              <span dir="rtl" lang="ur" className="text-[12px] text-ink-muted">
                · میری زمین کھولیں
              </span>
              <ArrowRight className="size-4 self-center" />
            </Link>
          </div>

          <div className="relative h-[420px] lg:h-auto">
            <PakistanSVG />
          </div>
        </div>
      </div>
    </section>
  );
}

// Pakistan boundary as (lon, lat) — simplified from Natural Earth.
// Projected linearly into the 600x500 SVG viewBox (acceptable at PK latitudes):
//   x = 10 + (lon - 60.5) * 33.14
//   y = 10 + (37   - lat) * 35.56
const PK_LONLAT: [number, number][] = [
  [74.9, 37.05], [75.95, 36.95], [76.75, 35.7], [77.05, 35.1],
  [76.6, 34.65], [75.4, 34.55],
  [74.35, 32.75], [75.25, 32.2], [74.5, 31.2], [73.9, 30.4],
  [73.0, 29.3], [71.5, 27.85], [70.6, 27.7], [70.05, 26.55],
  [69.5, 24.3], [68.85, 23.9],
  [68.2, 23.85], [67.3, 24.0], [66.7, 24.85], [66.4, 25.2],
  [65.1, 25.2], [64.3, 25.3], [63.5, 25.25], [62.55, 25.1],
  [61.9, 25.15],
  [61.75, 26.25], [61.7, 27.25], [62.4, 28.0], [62.75, 28.8],
  [62.4, 29.4],
  [60.85, 29.85], [61.65, 31.45], [64.15, 31.4], [66.4, 30.95],
  [66.95, 31.3], [68.25, 31.85], [69.3, 31.95], [69.5, 33.0],
  [70.4, 33.95], [71.1, 34.05], [71.55, 34.4], [71.05, 35.0],
  [71.6, 35.45], [72.6, 36.85], [73.7, 36.9], [74.5, 37.0]
];

function project(lon: number, lat: number) {
  return { x: 10 + (lon - 60.5) * 33.14, y: 10 + (37 - lat) * 35.56 };
}

const PK_PATH =
  "M" +
  PK_LONLAT
    .map(([lon, lat]) => {
      const { x, y } = project(lon, lat);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" L") +
  " Z";

const CITIES = [
  { lon: 71.55, lat: 34.02, label: "Peshawar" },
  { lon: 73.04, lat: 33.68, label: "Islamabad" },
  { lon: 74.34, lat: 31.55, label: "Lahore" },
  { lon: 73.13, lat: 31.45, label: "Faisalabad" },
  { lon: 71.47, lat: 30.16, label: "Multan" },
  { lon: 67.02, lat: 30.18, label: "Quetta" },
  { lon: 67.0, lat: 24.86, label: "Karachi" }
];

function PakistanSVG() {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 60% at 55% 55%, rgba(77,155,255,0.14), transparent 70%)"
        }}
      />
      <svg
        viewBox="0 0 600 500"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        aria-label="Map of Pakistan with regional scan activity"
      >
        <defs>
          <linearGradient id="pkFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4D9BFF" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#00D4FF" stopOpacity="0.06" />
          </linearGradient>
          <filter id="pkGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        <path d={PK_PATH} fill="#4D9BFF" opacity="0.10" filter="url(#pkGlow)" />

        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2.2, ease: "easeInOut" }}
          d={PK_PATH}
          fill="url(#pkFill)"
          stroke="#FFD600"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray="3 2"
        />

        {CITIES.map((c) => {
          const { x, y } = project(c.lon, c.lat);
          return (
            <g key={c.label}>
              <circle cx={x} cy={y} r="3.2" fill="#00D4FF" />
              <circle
                cx={x}
                cy={y}
                r="8"
                fill="none"
                stroke="#00D4FF"
                strokeOpacity="0.4"
              >
                <animate
                  attributeName="r"
                  from="3.2"
                  to="14"
                  dur="2.2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="stroke-opacity"
                  from="0.6"
                  to="0"
                  dur="2.2s"
                  repeatCount="indefinite"
                />
              </circle>
              <text
                x={x + 10}
                y={y + 3}
                fill="#D8D8E0"
                fontSize="11"
                fontFamily="Inter"
              >
                {c.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between glass rounded-md px-3 py-2 text-[11px] text-ink-muted">
        <span>Live scans</span>
        <span className="font-mono text-accent-glow">2,481 today</span>
      </div>
    </div>
  );
}
