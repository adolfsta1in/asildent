import type { LocalizedText } from "@/config/clinic";

/** Достаёт строку нужного языка из Json { ru, ky }. Если перевода нет — берём русский. */
export function tr(value: unknown, locale: string): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const v = value as Partial<LocalizedText>;
    const text = locale === "ky" ? v.ky?.trim() || v.ru : v.ru || v.ky;
    return text ?? "";
  }
  return "";
}

export function asLocalized(value: unknown): LocalizedText {
  if (value && typeof value === "object") {
    const v = value as Partial<LocalizedText>;
    return { ru: v.ru ?? "", ky: v.ky ?? "" };
  }
  return { ru: typeof value === "string" ? value : "", ky: "" };
}

export function asLocalizedList(value: unknown): LocalizedText[] {
  return Array.isArray(value) ? value.map(asLocalized) : [];
}
