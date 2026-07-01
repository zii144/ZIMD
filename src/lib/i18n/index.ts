import { writable, derived, type Readable } from "svelte/store";
import { en } from "./en";
import { zhTW } from "./zh-TW";
import { ja } from "./ja";
import { es } from "./es";

export type LocaleCode = "en" | "zh-TW" | "ja" | "es";

/** Selectable languages, labelled in their own script. */
export const locales: { code: LocaleCode; name: string }[] = [
  { code: "en", name: "English" },
  { code: "zh-TW", name: "繁體中文" },
  { code: "ja", name: "日本語" },
  { code: "es", name: "Español" },
];

export const dictionaries: Record<LocaleCode, Record<string, string>> = {
  en,
  "zh-TW": zhTW,
  ja,
  es,
};

const KEY = "zimd.locale.v1";

/** Map an OS/browser locale onto the closest supported language. */
function detect(): LocaleCode {
  try {
    const stored = localStorage.getItem(KEY) as LocaleCode | null;
    if (stored && dictionaries[stored]) return stored;
  } catch {
    /* ignore */
  }
  const nav =
    (typeof navigator !== "undefined" ? navigator.language : "en") || "en";
  const low = nav.toLowerCase();
  if (low.startsWith("zh")) return "zh-TW";
  if (low.startsWith("ja")) return "ja";
  if (low.startsWith("es")) return "es";
  return "en";
}

/** The active language. */
export const locale = writable<LocaleCode>(detect());
locale.subscribe((l) => {
  try {
    localStorage.setItem(KEY, l);
  } catch {
    /* ignore */
  }
  if (typeof document !== "undefined") document.documentElement.lang = l;
});

/** Reactive translator: `$t("some.key")`. Falls back to English, then the key. */
export const t: Readable<(key: string) => string> = derived(locale, ($l) => {
  const dict = dictionaries[$l] ?? en;
  return (key: string): string => dict[key] ?? en[key] ?? key;
});

export function setLocale(code: LocaleCode): void {
  locale.set(code);
}
