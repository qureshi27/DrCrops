"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Camera, Satellite, Sparkles } from "lucide-react";
import { useT } from "@/lib/i18n/store";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  const t = useT();
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh" />
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="flex items-center gap-2 mb-6"
            >
              <Badge variant="accent">
                <Sparkles className="size-3" />
                {t("hero.eyebrow")}
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
              className="text-hero text-gradient"
            >
              {t("hero.title.a")}
              <br />
              <span className="text-accent-gradient">{t("hero.title.b")}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="mt-6 text-lg text-ink-muted max-w-xl leading-relaxed"
            >
              {t("hero.subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <Link
                href="/diagnose"
                className="inline-flex items-center gap-2 rounded-pill px-6 py-3.5 text-sm font-semibold bg-gradient-to-r from-accent to-accent-glow text-black shadow-glow-cyan hover:brightness-110 transition"
              >
                <Camera className="size-4" />
                {t("cta.diagnose")}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/farm"
                className="inline-flex items-center gap-2 rounded-pill px-6 py-3.5 text-sm border border-field/60 text-ink hover:bg-field/10 hover:border-field transition"
              >
                <Satellite className="size-4 text-field" />
                {t("map.cta")}
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-10 flex flex-wrap items-center gap-3 text-xs"
            >
              <Badge>
                <span className="size-1.5 rounded-full bg-accent-glow animate-pulse-glow" />
                {t("hero.badge.nim")}
              </Badge>
              <Badge variant="field">
                <span className="size-1.5 rounded-full bg-field animate-pulse-glow" />
                {t("hero.badge.sat")}
              </Badge>
            </motion.div>
          </div>

          {/* Tilted preview stack */}
          <div className="lg:col-span-6 relative h-[560px] hidden lg:block">
            <PreviewStack />
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-bg-base" />
    </section>
  );
}

function PreviewStack() {
  return (
    <div className="absolute inset-0">
      {/* Back card — NDVI map */}
      <motion.div
        initial={{ opacity: 0, x: 40, y: -20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.9, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="tilt-card-r absolute top-0 right-0 w-[420px] h-[280px] card-elevated overflow-hidden shadow-card"
      >
        <NDVIPreview />
      </motion.div>

      {/* Mid card — Disease result */}
      <motion.div
        initial={{ opacity: 0, x: -30, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.9, delay: 0.55, ease: [0.4, 0, 0.2, 1] }}
        className="tilt-card absolute bottom-8 left-0 w-[380px] h-[300px] card overflow-hidden shadow-glow"
      >
        <DiagnosisPreview />
      </motion.div>

      {/* Front pill — Confidence chip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.85 }}
        className="absolute bottom-32 right-16 glass rounded-pill px-4 py-2.5 flex items-center gap-2 text-sm shadow-glow"
      >
        <span className="font-mono text-accent-glow text-base">94.2%</span>
        <span className="text-ink-muted">confidence · yellow rust</span>
      </motion.div>
    </div>
  );
}

function NDVIPreview() {
  return (
    <div className="relative h-full w-full">
      {/* Pseudo NDVI heatmap */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 40% 40%, #2bd47a 0%, #f0d34a 40%, #d76b3a 70%, #6b1e1e 100%)"
        }}
      />
      <div className="absolute inset-0 bg-grid opacity-40" />
      {/* Field polygon */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
        <polygon
          points="22,28 78,22 82,72 30,80"
          fill="rgba(255,214,0,0.05)"
          stroke="#FFD600"
          strokeWidth="0.5"
          strokeDasharray="2 1"
        />
      </svg>
      <div className="absolute top-4 left-4 glass rounded-md px-3 py-1.5 text-xs">
        <p className="text-ink-dim text-[10px]">NDVI · 12 May 2026</p>
        <p className="font-mono text-field text-sm">0.71 avg</p>
      </div>
      <div className="absolute bottom-4 right-4 glass rounded-md px-3 py-2 text-[10px] text-ink-muted">
        <div className="flex items-center gap-2">
          <span className="inline-block w-12 h-1.5 rounded bg-gradient-to-r from-[#6b1e1e] via-[#f0d34a] to-[#2bd47a]" />
          <span>0 → 1</span>
        </div>
      </div>
    </div>
  );
}

function DiagnosisPreview() {
  return (
    <div className="relative h-full w-full p-5 flex flex-col">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-ink-dim uppercase tracking-wider">
            Detected
          </p>
          <p className="mt-1 text-xl font-semibold">Yellow Rust</p>
          <p className="text-sm text-ink-muted">Wheat · Punjab</p>
        </div>
        <div className="card-elevated rounded-md px-2.5 py-1.5">
          <p className="text-[10px] text-ink-dim">Severity</p>
          <p className="font-mono text-base text-field">Moderate</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: "Organic", value: "Neem oil 3%" },
          { label: "Biological", value: "Trichoderma" },
          { label: "Chemical", value: "Tebuconazole" }
        ].map((t) => (
          <div
            key={t.label}
            className="card-elevated rounded-md p-2.5"
          >
            <p className="text-[10px] text-ink-dim">{t.label}</p>
            <p className="text-xs mt-1 text-ink">{t.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex-1 card-elevated rounded-md p-3">
        <div className="flex items-center justify-between text-[11px] text-ink-dim">
          <span>Spread risk · next 7d</span>
          <span className="font-mono text-accent-glow">HIGH</span>
        </div>
        <div className="mt-2 flex gap-1 h-10 items-end">
          {[40, 55, 62, 70, 78, 84, 90].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-gradient-to-t from-accent/30 to-accent-glow"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
