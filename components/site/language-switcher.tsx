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
        <span>{current.native}</span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-48 card-elevated p-1 z-50 animate-fade-up"
        >
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLocale(l.code as Locale);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-white/5 transition",
                l.code === locale ? "text-ink" : "text-ink-muted"
              )}
            >
              <span className="flex items-center gap-2">
                <span className="text-xs text-ink-dim w-8">{l.code}</span>
                <span>{l.native}</span>
              </span>
              {l.code === locale && <Check className="size-4 text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
