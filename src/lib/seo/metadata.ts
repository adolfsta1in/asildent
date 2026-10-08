import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { localizedUrl } from "./jsonld";

/** canonical + hreflang для страницы. path — без префикса локали, например "/uslugi". */
export function pageAlternates(locale: string, path: string): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l === "ky" ? "ky-KG" : "ru-RU"] = localizedUrl(l, path);
  languages["x-default"] = localizedUrl(routing.defaultLocale, path);
  return { canonical: localizedUrl(locale, path), languages };
}
