"use client";

import { useT } from "@/lib/i18n/store";
import { Sprout, GraduationCap } from "lucide-react";

export function Footer() {
  const t = useT();
  return (
    <footer className="mt-32 border-t border-line">
      <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center size-8 rounded-md bg-gradient-to-br from-accent to-accent-glow text-black">
            <Sprout className="size-4.5" strokeWidth={2.5} />
          </span>
          <div>
            <p className="text-sm text-ink">{t("footer.tag")}</p>
            <p className="text-xs text-ink-dim mt-0.5">{t("footer.disclaimer")}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-ink-dim">
          <span className="inline-flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-accent-glow animate-pulse-glow" />
            NVIDIA NIM
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-field animate-pulse-glow" />
            Sentinel-2
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-accent animate-pulse-glow" />
            Google Maps
          </span>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto max-w-7xl px-6 py-5 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 text-xs text-ink-dim">
          <span className="inline-flex items-center gap-2">
            <GraduationCap className="size-3.5 text-field" />
            Powered by <span className="text-ink font-medium">Department of Intelligent Systems</span>
          </span>
          <span className="text-[11px] text-ink-dim/70">
            © {new Date().getFullYear()} · See Pakistan
          </span>
        </div>
      </div>
    </footer>
  );
}
