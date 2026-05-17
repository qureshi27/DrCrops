"use client";

import { motion } from "framer-motion";
import { Camera, Cpu, Leaf } from "lucide-react";
import { useT } from "@/lib/i18n/store";

export function HowItWorks() {
  const t = useT();
  const steps = [
    { Icon: Camera, titleKey: "how.step1.title", bodyKey: "how.step1.body" },
    { Icon: Cpu, titleKey: "how.step2.title", bodyKey: "how.step2.body" },
    { Icon: Leaf, titleKey: "how.step3.title", bodyKey: "how.step3.body" }
  ];
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-sm uppercase tracking-[0.2em] text-ink-dim">
          Process
        </p>
        <h2 className="mt-3 text-h2 text-gradient">{t("how.title")}</h2>
        <p className="mt-3 text-ink-muted">{t("how.subtitle")}</p>
      </div>

      <div className="mt-16 grid md:grid-cols-3 gap-6 relative">
        <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        {steps.map(({ Icon, titleKey, bodyKey }, i) => (
          <motion.div
            key={titleKey}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
            className="card p-6 relative"
          >
            <div className="size-12 rounded-lg bg-gradient-to-br from-accent/20 to-accent-glow/10 border border-accent/30 grid place-items-center">
              <Icon className="size-5 text-accent-glow" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">{t(titleKey)}</h3>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">
              {t(bodyKey)}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
