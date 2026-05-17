"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { UploadZone } from "@/components/diagnose/upload-zone";
import { CropPicker } from "@/components/diagnose/crop-picker";
import { ResultView } from "@/components/diagnose/result-view";
import { fileToCompressedDataUrl } from "@/lib/image";
import { useLocale } from "@/lib/i18n/store";
import { useScans } from "@/lib/scan-store";
import type { Diagnosis } from "@/lib/diagnosis-schema";

export default function DiagnosePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <DiagnoseInner />
    </Suspense>
  );
}

function PageLoader() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-24 text-center">
      <Loader2 className="size-6 mx-auto animate-spin text-accent-glow" />
    </div>
  );
}

function DiagnoseInner() {
  const params = useSearchParams();
  const router = useRouter();
  const initialCrop = params.get("crop") ?? undefined;
  const locale = useLocale((s) => s.locale);
  const addScan = useScans((s) => s.addScan);

  const [crop, setCrop] = useState<string | undefined>(initialCrop);
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setBusy(true);
    setDiagnosis(null);
    try {
      const { dataUrl, thumbnail } = await fileToCompressedDataUrl(file);
      setImageUrl(dataUrl);
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: dataUrl,
          crop,
          lang: locale,
          notes
        })
      });
      const json = await res.json();
      if (!res.ok) {
        setError(
          typeof json?.error === "string"
            ? json.error
            : json?.message ?? "Diagnosis failed. Try again."
        );
        return;
      }
      const d = json.diagnosis as Diagnosis;
      setDiagnosis(d);
      const id = crypto.randomUUID();
      addScan({
        id,
        createdAt: Date.now(),
        cropHint: crop,
        thumbnail,
        diagnosis: d,
        lang: locale
      });
      window.history.replaceState(null, "", `/diagnose?scan=${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <p className="text-sm uppercase tracking-[0.2em] text-ink-dim">
          Diagnose
          <span dir="rtl" lang="ur" className="ms-2 normal-case tracking-normal">
            · تشخیص
          </span>
        </p>
        <h1 className="mt-2 text-4xl font-bold text-gradient">
          Identify what's wrong with your crop
        </h1>
        <p dir="rtl" lang="ur" className="mt-2 text-xl text-ink-muted">
          اپنی فصل کا مسئلہ پہچانیں
        </p>
        <p className="mt-3 text-ink-muted max-w-2xl">
          Upload a clear photo of the affected leaf, root, stem or fruit. The AI
          returns the disease, severity, and a treatment plan in your language.
        </p>
        <p
          dir="rtl"
          lang="ur"
          className="mt-2 text-sm text-ink-dim leading-loose max-w-2xl"
        >
          متاثرہ پتے، جڑ، تنے یا پھل کی واضح تصویر اپلوڈ کریں۔ AI آپ کو
          بیماری، شدت اور علاج بتائے گا۔
        </p>
      </motion.div>

      {!diagnosis && (
        <div className="space-y-6">
          <div className="card p-6">
            <p className="text-xs uppercase tracking-wider text-ink-dim mb-3">
              Crop (optional)
              <span dir="rtl" lang="ur" className="ms-2 normal-case tracking-normal">
                · فصل (اختیاری)
              </span>
            </p>
            <CropPicker value={crop} onChange={setCrop} />
          </div>

          <UploadZone busy={busy} onFile={handleFile} />

          <div className="card p-6">
            <label className="text-xs uppercase tracking-wider text-ink-dim">
              Symptoms or notes (optional)
              <span dir="rtl" lang="ur" className="ms-2 normal-case tracking-normal">
                · علامات یا تفصیلات (اختیاری)
              </span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. yellow patches on lower leaves, started 4 days ago after rain — مثلاً نچلے پتوں پر زرد دھبے، 4 دن پہلے بارش کے بعد شروع ہوئے"
              className="mt-2 w-full bg-bg-elevated border border-line rounded-md p-3 text-sm text-ink placeholder:text-ink-dim focus:outline-none focus:border-accent/60"
              rows={3}
            />
          </div>

          {error && (
            <div className="card border border-red-400/30 bg-red-400/5 p-4 flex gap-3 items-start text-sm">
              <AlertCircle className="size-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300">
                  Diagnosis failed
                  <span dir="rtl" lang="ur" className="ms-2 text-red-300/80">
                    · تشخیص ناکام
                  </span>
                </p>
                <p className="text-ink-muted mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {diagnosis && imageUrl && (
        <>
          <ResultView imageUrl={imageUrl} diagnosis={diagnosis} />
          <div className="mt-10 flex flex-wrap gap-3">
            <button
              onClick={() => {
                setDiagnosis(null);
                setImageUrl(null);
                setError(null);
                window.history.replaceState(null, "", "/diagnose");
              }}
              className="inline-flex items-baseline gap-2 rounded-pill px-6 py-3 text-sm border border-line text-ink hover:bg-white/5 transition"
            >
              <span>New scan</span>
              <span dir="rtl" lang="ur" className="text-xs text-ink-muted">
                · نئی تصویر
              </span>
            </button>
            <button
              onClick={() => router.push("/history")}
              className="inline-flex items-baseline gap-2 rounded-pill px-6 py-3 text-sm bg-accent text-white hover:brightness-110 transition"
            >
              <span>View history</span>
              <span dir="rtl" lang="ur" className="text-xs opacity-90">
                · ریکارڈ دیکھیں
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
