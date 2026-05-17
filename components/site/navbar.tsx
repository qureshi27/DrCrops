"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sprout } from "lucide-react";
import { LanguageSwitcher } from "./language-switcher";
import { cn } from "@/lib/utils";

const links: { href: string; en: string; ur: string }[] = [
  { href: "/diagnose", en: "Diagnose", ur: "تشخیص" },
  { href: "/farm", en: "My Farm", ur: "میری زمین" },
  { href: "/weather", en: "Weather", ur: "موسم" },
  { href: "/calculator/fertilizer", en: "Fertilizer", ur: "کھاد" },
  { href: "/learn", en: "Learn", ur: "سیکھیں" },
  { href: "/history", en: "History", ur: "ریکارڈ" }
];

export function Navbar() {
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
                      "px-3 py-1.5 rounded-pill text-sm transition inline-flex items-baseline gap-1.5",
                      active
                        ? "bg-white/10 text-ink"
                        : "text-ink-muted hover:text-ink hover:bg-white/5"
                    )}
                  >
                    <span>{l.en}</span>
                    <span
                      dir="rtl"
                      lang="ur"
                      className="text-[11px] text-ink-dim"
                    >
                      · {l.ur}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="ms-auto flex items-center gap-2">
            <LanguageSwitcher />
            <Link
              href="/diagnose"
              className="hidden sm:inline-flex items-baseline gap-1.5 rounded-pill px-4 py-1.5 text-sm font-medium bg-accent text-white shadow-glow hover:brightness-110 transition"
            >
              <span>Diagnose a Plant</span>
              <span dir="rtl" lang="ur" className="text-[11px] opacity-80">
                · پودے کی تشخیص
              </span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
