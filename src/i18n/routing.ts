import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ru", "ky"],
  defaultLocale: "ru",
  localePrefix: "as-needed",
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];

export function isLocale(value: string | undefined | null): value is Locale {
  return typeof value === "string" && (routing.locales as readonly string[]).includes(value);
}
