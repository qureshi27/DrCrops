"use client";

import { CROPS } from "@/lib/crops";
import { cn } from "@/lib/utils";

export function CropPicker({
  value,
  onChange
}: {
  value?: string;
  onChange: (id: string | undefined) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(undefined)}
        className={cn(
          "rounded-pill px-3 py-1.5 text-xs border transition",
          !value
            ? "bg-accent text-white border-accent"
            : "border-line text-ink-muted hover:text-ink hover:bg-white/5"
        )}
      >
        Auto-detect
      </button>
      {CROPS.map((c) => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          className={cn(
            "rounded-pill px-3 py-1.5 text-xs border transition inline-flex items-center gap-1.5",
            value === c.id
              ? "bg-field/10 text-field border-field/60"
              : "border-line text-ink-muted hover:text-ink hover:bg-white/5"
          )}
        >
          <span>{c.emoji}</span>
          <span>{c.name}</span>
        </button>
      ))}
    </div>
  );
}
