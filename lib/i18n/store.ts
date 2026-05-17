"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_LOCALE, getDir, type Locale } from "./languages";
import { MESSAGES } from "./messages";

type State = {
  locale: Locale;
  setLocale: (l: Locale) => void;
};

export const useLocale = create<State>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (l) => {
        if (typeof document !== "undefined") {
          document.documentElement.lang = l;
          document.documentElement.dir = getDir(l);
        }
        set({ locale: l });
      }
    }),
    { name: "yld.locale" }
  )
);

export function useT() {
  const locale = useLocale((s) => s.locale);
  return (key: string) => MESSAGES[locale]?.[key] ?? MESSAGES.en[key] ?? key;
}
