"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Leaf,
  Skull,
  TestTube2,
  ShieldCheck,
  Image as ImageIcon
} from "lucide-react";
import type { Diagnosis } from "@/lib/diagnosis-schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const severityMap = {
  none: { label: "None", color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" },
  mild: { label: "Mild", color: "text-yellow-300 border-yellow-300/30 bg-yellow-300/10" },
  moderate: { label: "Moderate", color: "text-orange-400 border-orange-400/30 bg-orange-400/10" },
  severe: { label: "Severe", color: "text-red-400 border-red-400/30 bg-red-400/10" }
};

const urgencyLabel = {
  routine: "Routine",
  this_week: "This week",
  immediate: "Immediate"
};

export function ResultView({
  imageUrl,
  diagnosis
}: {
  imageUrl: string;
  diagnosis: Diagnosis;
}) {
  if (!diagnosis.is_plant) {
    return (
      <div className="card-elevated p-8 text-center">
        <AlertTriangle className="size-10 text-yellow-300 mx-auto" />
        <h3 className="mt-4 text-xl font-semibold">
          That doesn't look like a plant
          <span dir="rtl" lang="ur" className="block text-sm text-ink-muted mt-1 font-normal">
            یہ پودا نہیں لگتا
          </span>
        </h3>
        <p className="mt-2 text-ink-muted">
          Try another photo of a leaf, stem or fruit in good light.
        </p>
      </div>
    );
  }

  const sev = severityMap[diagnosis.severity];
  const lowConfidence = diagnosis.confidence < 60;
  const desc = diagnosis.image_description;

  return (
    <div className="space-y-6">
      {/* Image description — friendly, bilingual narrative shown first */}
      {(desc?.plant || desc?.en || desc?.ur) && (
        <div className="card p-6 border border-accent-glow/20 bg-gradient-to-br from-accent/5 to-transparent">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="size-4 text-accent-glow" />
            <p className="text-xs uppercase tracking-[0.2em] text-ink-dim">
              What's in this photo
              <span dir="rtl" lang="ur" className="ms-2 text-ink-muted">
                · اس تصویر میں کیا ہے
              </span>
            </p>
          </div>
          {desc.plant && (
            <p className="text-xl font-semibold text-accent-glow mb-3">
              {desc.plant}
            </p>
          )}
          {desc.en && (
            <p className="text-sm text-ink leading-relaxed">{desc.en}</p>
          )}
          {desc.ur && (
            <p
              dir="rtl"
              lang="ur"
              className="text-sm text-ink-muted leading-relaxed mt-3 pt-3 border-t border-line"
            >
              {desc.ur}
            </p>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6">
      {/* Left: image */}
      <div className="lg:col-span-5 space-y-4">
        <div className="card-elevated overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Scan" className="w-full h-auto block" />
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-dim uppercase tracking-wider">
            Confidence
            <span dir="rtl" lang="ur" className="ms-2 normal-case tracking-normal">· اعتماد</span>
          </p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-3xl font-mono text-accent-glow">
              {diagnosis.confidence.toFixed(1)}
            </span>
            <span className="text-ink-muted mb-1">%</span>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent-glow"
              style={{ width: `${diagnosis.confidence}%` }}
            />
          </div>
          {lowConfidence && (
            <p className="mt-3 text-xs text-yellow-300/90 leading-relaxed">
              Low confidence — try a closer photo of an affected leaf in daylight, or ask the community.
            </p>
          )}
        </div>
      </div>

      {/* Right: diagnosis */}
      <div className="lg:col-span-7 space-y-6">
        <div className="card p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-ink-dim uppercase tracking-wider">
                Diagnosis
                <span dir="rtl" lang="ur" className="ms-2 normal-case tracking-normal">· تشخیص</span>
              </p>
              <h2 className="mt-1 text-2xl font-semibold">{diagnosis.disease}</h2>
              {diagnosis.scientific_name && (
                <p className="text-sm text-ink-muted italic">
                  {diagnosis.scientific_name}
                </p>
              )}
              {diagnosis.crop && (
                <p className="text-sm text-ink-muted mt-1">
                  Crop <span dir="rtl" lang="ur">· فصل</span>: {diagnosis.crop}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className={cn("inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs border", sev.color)}>
                <Skull className="size-3" /> {sev.label}
              </div>
              <Badge variant="accent">
                {urgencyLabel[diagnosis.urgency]}
              </Badge>
              <Badge>
                Spread risk: {diagnosis.spread_risk}
              </Badge>
            </div>
          </div>

          {diagnosis.follow_up && (
            <p className="mt-4 text-sm text-ink leading-relaxed border-l-2 border-field/60 ps-3">
              {diagnosis.follow_up}
            </p>
          )}
        </div>

        {/* Symptoms / Causes */}
        <div className="grid md:grid-cols-2 gap-4">
          <Section titleEn="Symptoms" titleUr="علامات" icon={<ImageIcon className="size-4" />}>
            {diagnosis.symptoms.length ? (
              <ul className="space-y-2 text-sm">
                {diagnosis.symptoms.map((s, i) => (
                  <li key={i} className="flex gap-2 text-ink-muted">
                    <span className="size-1.5 rounded-full bg-accent-glow mt-1.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            ) : null}
          </Section>
          <Section titleEn="Causes" titleUr="وجوہات" icon={<AlertTriangle className="size-4" />}>
            {diagnosis.causes.length ? (
              <ul className="space-y-2 text-sm">
                {diagnosis.causes.map((s, i) => (
                  <li key={i} className="flex gap-2 text-ink-muted">
                    <span className="size-1.5 rounded-full bg-field mt-1.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            ) : null}
          </Section>
        </div>

        {/* Treatments */}
        <div className="space-y-4">
          <h3 className="text-sm uppercase tracking-[0.2em] text-ink-dim">
            Treatment options
            <span dir="rtl" lang="ur" className="ms-2 normal-case tracking-normal">· علاج کے طریقے</span>
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <TreatCol
              title="Organic"
              urTitle="نامیاتی"
              icon={<Leaf className="size-4 text-emerald-400" />}
              items={diagnosis.treatments.organic}
              tint="emerald"
            />
            <TreatCol
              title="Biological"
              urTitle="حیاتیاتی"
              icon={<TestTube2 className="size-4 text-accent-glow" />}
              items={diagnosis.treatments.biological}
              tint="cyan"
            />
            <TreatCol
              title="Chemical"
              urTitle="کیمیائی"
              icon={<ShieldCheck className="size-4 text-field" />}
              items={diagnosis.treatments.chemical}
              tint="field"
            />
          </div>
        </div>

        {/* Prevention */}
        {diagnosis.prevention.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <h3 className="font-semibold">
                Prevent recurrence
                <span dir="rtl" lang="ur" className="ms-2 text-ink-muted text-xs font-normal">
                  · دوبارہ ہونے سے بچاؤ
                </span>
              </h3>
            </div>
            <ul className="grid sm:grid-cols-2 gap-2 text-sm">
              {diagnosis.prevention.map((p, i) => (
                <li key={i} className="flex gap-2 text-ink-muted">
                  <span className="size-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

function Section({
  titleEn,
  titleUr,
  icon,
  children
}: {
  titleEn: string;
  titleUr: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3 text-ink">
        {icon}
        <h4 className="font-medium">
          {titleEn}
          <span dir="rtl" lang="ur" className="ms-2 text-ink-muted text-xs font-normal">
            · {titleUr}
          </span>
        </h4>
      </div>
      {children}
    </div>
  );
}

function TreatCol({
  title,
  urTitle,
  icon,
  items,
  tint
}: {
  title: string;
  urTitle: string;
  icon: React.ReactNode;
  items: { name: string; dose?: string; timing?: string; notes?: string; active_ingredient?: string }[];
  tint: "emerald" | "cyan" | "field";
}) {
  const ring =
    tint === "emerald"
      ? "border-emerald-400/20"
      : tint === "cyan"
      ? "border-accent-glow/20"
      : "border-field/30";
  return (
    <div className={cn("card-elevated p-4 border", ring)}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className="text-sm font-semibold">
          {title}
          <span dir="rtl" lang="ur" className="ms-1.5 text-ink-muted text-[11px] font-normal">
            · {urTitle}
          </span>
        </h4>
      </div>
      <div className="space-y-3">
        {items.length === 0 && (
          <p className="text-xs text-ink-dim">No {title.toLowerCase()} option suggested.</p>
        )}
        {items.map((t, i) => (
          <div key={i} className="text-sm">
            <p className="text-ink">{t.name}</p>
            {t.active_ingredient && (
              <p className="text-[11px] text-ink-dim mt-0.5 italic">
                {t.active_ingredient}
              </p>
            )}
            {t.dose && (
              <p className="text-xs text-ink-muted mt-1">
                <span className="text-ink-dim">Dose:</span> {t.dose}
              </p>
            )}
            {t.timing && (
              <p className="text-xs text-ink-muted">
                <span className="text-ink-dim">Timing:</span> {t.timing}
              </p>
            )}
            {t.notes && (
              <p className="text-xs text-ink-dim mt-1 leading-snug">{t.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
