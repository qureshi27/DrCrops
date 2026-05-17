"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { LOCALES, type Locale } from "@/lib/i18n/languages";
import { useLocale } from "@/lib/i18n/store";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-pill px-3 py-1.5 text-sm text-ink-muted hover:text-ink hover:bg-white/5 transition"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="size-4" />
        <span className={current.dir === "rtl" ? "font-medium" : ""}>
          {current.label}
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-72 card-elevated p-2 z-50 animate-fade-up shadow-card"
        >
          <p className="px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-ink-dim">
            Choose your language
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {LOCALES.map((l) => {
              const active = l.code === locale;
              return (
                <button
                  key={l.code}
                  onClick={() => {
                    setLocale(l.code as Locale);
                    setOpen(false);
                  }}
                  className={cn(
                    "group relative rounded-md px-3 py-3 text-start transition border",
                    active
                      ? "bg-accent/10 border-accent/40"
                      : "bg-bg-elevated border-line hover:border-white/15 hover:bg-white/5"
                  )}
                >
                  <p
                    dir={l.dir}
                    className={cn(
                      "text-base leading-tight",
                      active ? "text-ink" : "text-ink"
                    )}
                  >
                    {l.native}
                  </p>
                  <p className="text-[11px] text-ink-dim mt-1">{l.label}</p>
                  {active && (
                    <Check className="absolute top-2 right-2 size-4 text-accent-glow" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
