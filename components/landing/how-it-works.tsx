"use client";

import { motion } from "framer-motion";
import { Camera, Cpu, Leaf } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      Icon: Camera,
      en: "1. Snap a photo",
      ur: "۱۔ تصویر بنائیں",
      bodyEn:
        "Use your phone camera or upload a leaf, stem, root or fruit image. Compressed locally to save mobile data.",
      bodyUr:
        "اپنا فون کیمرہ استعمال کریں یا پتے، تنے، جڑ یا پھل کی تصویر اپلوڈ کریں۔ ڈیٹا بچانے کے لیے مقامی طور پر کمپریس کی جاتی ہے۔"
    },
    {
      Icon: Cpu,
      en: "2. AI diagnosis",
      ur: "۲۔ AI تشخیص",
      bodyEn:
        "NVIDIA vision models identify the disease, severity and confidence — and briefly describe what they see in the photo.",
      bodyUr:
        "NVIDIA کے ماڈلز بیماری اور شدت کی شناخت کرتے ہیں اور تصویر میں کیا نظر آ رہا ہے، مختصراً بتاتے ہیں۔"
    },
    {
      Icon: Leaf,
      en: "3. Treatment plan",
      ur: "۳۔ علاج کا منصوبہ",
      bodyEn:
        "Get organic, biological and chemical options — translated into your language with Pakistan-registered products.",
      bodyUr:
        "آرگینک، حیاتیاتی اور کیمیائی علاج — آپ کی زبان میں، پاکستان میں منظور شدہ مصنوعات کے ساتھ۔"
    }
  ];

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-sm uppercase tracking-[0.2em] text-ink-dim">
          Process
          <span dir="rtl" lang="ur" className="ms-2 normal-case tracking-normal">
            · طریقہ کار
          </span>
        </p>
        <h2 className="mt-3 text-h2 text-gradient">How it works</h2>
        <p dir="rtl" lang="ur" className="mt-2 text-xl text-ink-muted">
          یہ کیسے کام کرتا ہے
        </p>
        <p className="mt-3 text-ink-muted">
          Three steps. Less than ten seconds.
          <span dir="rtl" lang="ur" className="ms-2">
            · تین مراحل، دس سیکنڈ سے کم میں
          </span>
        </p>
      </div>

      <div className="mt-16 grid md:grid-cols-3 gap-6 relative">
        <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        {steps.map(({ Icon, en, ur, bodyEn, bodyUr }, i) => (
          <motion.div
            key={en}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
            className="card p-6 relative"
          >
            <div className="size-12 rounded-lg bg-gradient-to-br from-accent/20 to-accent-glow/10 border border-accent/30 grid place-items-center">
              <Icon className="size-5 text-accent-glow" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">{en}</h3>
            <p dir="rtl" lang="ur" className="text-sm text-ink-muted">
              {ur}
            </p>
            <p className="mt-3 text-sm text-ink-muted leading-relaxed">
              {bodyEn}
            </p>
            <p
              dir="rtl"
              lang="ur"
              className="mt-2 text-xs text-ink-dim leading-relaxed"
            >
              {bodyUr}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
