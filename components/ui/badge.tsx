import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "field" | "accent";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-medium",
        variant === "default" && "bg-white/5 text-ink-muted border border-line",
        variant === "field" && "bg-field/10 text-field border border-field/30",
        variant === "accent" &&
          "bg-accent/10 text-accent border border-accent/30",
        className
      )}
      {...props}
    />
  );
}
