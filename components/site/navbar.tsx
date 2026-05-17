"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sprout } from "lucide-react";
import { useT } from "@/lib/i18n/store";
import { LanguageSwitcher } from "./language-switcher";
import { cn } from "@/lib/utils";

const links = [
  { href: "/diagnose", key: "nav.diagnose" },
  { href: "/farm", key: "nav.farm" },
  { href: "/weather", key: "nav.weather" },
  { href: "/calculator/fertilizer", key: "nav.calculator" },
  { href: "/learn", key: "nav.learn" },
  { href: "/history", key: "nav.history" }
];

export function Navbar() {
  const t = useT();
  const path = usePathname();

  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <nav className="glass rounded-pill px-4 py-2 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 px-2 group">
            <span className="grid place-items-center size-8 rounded-md bg-gradient-to-br from-accent to-accent-glow text-black">
              <Sprout className="size-4.5" strokeWidth={2.5} />
            </span>
            <span className="font-semibold tracking-tight">Dr Crops<span className="text-accent">.</span></span>
          </Link>

          <ul className="hidden md:flex items-center gap-1 flex-1">
            {links.map((l) => {
              const active = path.startsWith(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={cn(
                      "px-3 py-1.5 rounded-pill text-sm transition",
                      active
                        ? "bg-white/10 text-ink"
                        : "text-ink-muted hover:text-ink hover:bg-white/5"
                    )}
                  >
                    {t(l.key)}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="ms-auto flex items-center gap-2">
            <LanguageSwitcher />
            <Link
              href="/diagnose"
              className="hidden sm:inline-flex items-center rounded-pill px-4 py-1.5 text-sm font-medium bg-accent text-white shadow-glow hover:brightness-110 transition"
            >
              {t("cta.diagnose")}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
