export type Locale = "en" | "ur" | "pa" | "sd" | "ps" | "skr";

export const LOCALES: { code: Locale; label: string; native: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "English", native: "English", dir: "ltr" },
  { code: "ur", label: "Urdu", native: "اردو", dir: "rtl" },
  { code: "pa", label: "Punjabi", native: "پنجابی", dir: "rtl" },
  { code: "sd", label: "Sindhi", native: "سنڌي", dir: "rtl" },
  { code: "ps", label: "Pashto", native: "پښتو", dir: "rtl" },
  { code: "skr", label: "Saraiki", native: "سرائیکی", dir: "rtl" }
];

export const DEFAULT_LOCALE: Locale = "en";

export function getDir(locale: Locale): "ltr" | "rtl" {
  return LOCALES.find((l) => l.code === locale)?.dir ?? "ltr";
}
