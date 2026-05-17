import { cn } from "@/lib/utils";

/**
 * Bilingual text — renders English as the primary label with the Urdu
 * translation directly below (or beside, when `inline`).
 *
 * Use everywhere static UI strings live, so a Pakistani layman can read
 * either script without having to switch the locale.
 */
export function Bi({
  en,
  ur,
  className,
  inline = false,
  urdClassName,
  enClassName
}: {
  en: string;
  ur: string;
  className?: string;
  inline?: boolean;
  urdClassName?: string;
  enClassName?: string;
}) {
  if (inline) {
    return (
      <span className={cn("inline-flex items-baseline gap-1.5", className)}>
        <span className={enClassName}>{en}</span>
        <span
          dir="rtl"
          lang="ur"
          className={cn("text-ink-muted text-[0.85em]", urdClassName)}
        >
          ·&nbsp;{ur}
        </span>
      </span>
    );
  }
  return (
    <span className={cn("inline-flex flex-col leading-tight", className)}>
      <span className={enClassName}>{en}</span>
      <span
        dir="rtl"
        lang="ur"
        className={cn("text-ink-muted text-[0.78em] mt-0.5", urdClassName)}
      >
        {ur}
      </span>
    </span>
  );
}
