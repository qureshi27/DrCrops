"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useT } from "@/lib/i18n/store";
import { CROPS } from "@/lib/crops";

export function CropsGrid() {
  const t = useT();
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-sm uppercase tracking-[0.2em] text-ink-dim">Crops</p>
        <h2 className="mt-3 text-h2 text-gradient">{t("crops.title")}</h2>
        <p className="mt-3 text-ink-muted">{t("crops.subtitle")}</p>
      </div>

      <div className="mt-14 grid grid-cols-2 md:grid-cols-5 gap-4">
        {CROPS.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: (i % 5) * 0.05 }}
          >
            <Link
              href={`/diagnose?crop=${c.id}`}
              className="block card p-4 hover:border-accent/40 hover:bg-bg-elevated transition group"
            >
              <div className="text-3xl">{c.emoji}</div>
              <p className="mt-3 text-sm font-medium text-ink group-hover:text-accent-glow transition">
                {c.name}
              </p>
              <p className="text-xs text-ink-dim mt-1 capitalize">
                {c.season} · {c.zones[0]}
              </p>
              <p className="text-[11px] text-ink-dim mt-2 line-clamp-1">
                {c.commonDiseases[0]}, {c.commonDiseases[1]}…
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
