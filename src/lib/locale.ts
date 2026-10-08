import { locale as rootLocale } from "next/root-params";
import { isLocale, type Locale } from "@/i18n/routing";

/** Текущая локаль из сегмента [locale]. */
export async function getLocale(): Promise<Locale> {
  const raw = await rootLocale();
  return isLocale(raw) ? raw : "ru";
}
