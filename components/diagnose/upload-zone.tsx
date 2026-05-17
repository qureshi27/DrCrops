"use client";

import { useRef, useState } from "react";
import { Camera, ImagePlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function UploadZone({
  onFile,
  busy
}: {
  onFile: (file: File) => void;
  busy?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
      className={cn(
        "card-elevated rounded-lg border-2 border-dashed border-line p-10 transition relative overflow-hidden",
        drag && "border-field/60 bg-field/5",
        busy && "pointer-events-none opacity-70"
      )}
    >
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="size-16 rounded-full bg-gradient-to-br from-accent/20 to-accent-glow/10 border border-accent/30 grid place-items-center">
          {busy ? (
            <Loader2 className="size-7 text-accent-glow animate-spin" />
          ) : (
            <ImagePlus className="size-7 text-accent-glow" />
          )}
        </div>
        <h3 className="mt-5 text-lg font-semibold">
          {busy ? "Analysing image…" : "Drop a plant photo or use camera"}
        </h3>
        <p dir="rtl" lang="ur" className="text-sm text-ink-muted mt-1">
          {busy
            ? "تصویر کا تجزیہ ہو رہا ہے…"
            : "پودے کی تصویر یہاں ڈالیں یا کیمرہ کھولیں"}
        </p>
        <p className="mt-2 text-sm text-ink-muted max-w-md">
          JPEG / PNG up to 10 MB. Image stays on your device until you submit.
        </p>
        <p
          dir="rtl"
          lang="ur"
          className="text-xs text-ink-dim mt-1 max-w-md"
        >
          تصویر بھیجنے تک آپ کے فون پر ہی رہتی ہے۔
        </p>

        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="rounded-pill px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-accent to-accent-glow text-black shadow-glow-cyan hover:brightness-110 transition inline-flex items-baseline gap-2"
          >
            <Camera className="size-4 self-center" />
            <span>Open camera</span>
            <span dir="rtl" lang="ur" className="text-[12px] opacity-80">
              · کیمرہ
            </span>
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-pill px-5 py-2.5 text-sm border border-line text-ink hover:bg-white/5 transition inline-flex items-baseline gap-2"
          >
            <ImagePlus className="size-4 self-center" />
            <span>Choose file</span>
            <span dir="rtl" lang="ur" className="text-[12px] text-ink-muted">
              · فائل منتخب کریں
            </span>
          </button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </div>
  );
}
