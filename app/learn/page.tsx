"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, ArrowRight } from "lucide-react";
import { CROPS } from "@/lib/crops";

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-sm uppercase tracking-[0.2em] text-ink-dim">
          Learn
          <span dir="rtl" lang="ur" className="ms-2 normal-case tracking-normal">
            · سیکھیں
          </span>
        </p>
        <h1 className="mt-2 text-4xl font-bold text-gradient">Disease library</h1>
        <p dir="rtl" lang="ur" className="mt-2 text-xl text-ink-muted">
          بیماریوں کی فہرست
        </p>
        <p className="mt-2 text-ink-muted max-w-2xl">
          Quick reference for the diseases most likely to hit your crop in Pakistan.
        </p>
        <p
          dir="rtl"
          lang="ur"
          className="mt-1 text-sm text-ink-dim leading-loose max-w-2xl"
        >
          پاکستان میں آپ کی فصل پر آنے والی عام بیماریوں کا فوری حوالہ۔
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {CROPS.map((c) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{c.emoji}</span>
                <div>
                  <h3 className="font-semibold text-lg">{c.name}</h3>
                  <p className="text-xs text-ink-dim capitalize">
                    {c.season} · {c.zones.join(", ")}
                  </p>
                </div>
              </div>
              <Link
                href={`/diagnose?crop=${c.id}`}
                className="rounded-pill px-3 py-1.5 text-xs border border-line text-ink-muted hover:bg-white/5 transition inline-flex items-center gap-1.5"
              >
                Scan
                <ArrowRight className="size-3" />
              </Link>
            </div>

            <div className="mt-5">
              <p className="text-xs uppercase tracking-wider text-ink-dim mb-2">
                Common threats
              </p>
              <div className="flex flex-wrap gap-2">
                {c.commonDiseases.map((d) => (
                  <span
                    key={d}
                    className="rounded-pill px-2.5 py-1 text-xs bg-bg-elevated border border-line text-ink-muted"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 card-elevated p-6 flex items-start gap-4">
        <BookOpen className="size-5 text-accent-glow shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-ink">
            Coming next: deep dives for each disease — life cycle, look-alikes, decision
            thresholds, and curated extension references from PARC and provincial
            departments of agriculture.
          </p>
        </div>
      </div>
    </div>
  );
}
