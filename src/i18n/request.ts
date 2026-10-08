import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { CLINIC_TIME_ZONE } from "@/lib/time";
import { isLocale, routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  // Локаль берём из root params (работает со статическим рендерингом и "use cache").
  const candidate = locale ?? (await rootLocale().catch(() => undefined));
  const resolved = candidate && isLocale(candidate) ? candidate : routing.defaultLocale;

  return {
    locale: resolved,
    timeZone: CLINIC_TIME_ZONE,
    messages: (await import(`../../messages/${resolved}.json`)).default,
  };
});
