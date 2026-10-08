import type { LocalizedText } from "@/config/clinic";

/** Помощники для разбора FormData в server actions админки. */
export function str(fd: FormData, name: string): string {
  const v = fd.get(name);
  return typeof v === "string" ? v.trim() : "";
}

export function int(fd: FormData, name: string, fallback = 0): number {
  const n = Number.parseInt(str(fd, name), 10);
  return Number.isFinite(n) ? n : fallback;
}

export function num(fd: FormData, name: string, fallback = 0): number {
  const n = Number.parseFloat(str(fd, name).replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

export function bool(fd: FormData, name: string): boolean {
  const v = fd.get(name);
  return v === "on" || v === "true" || v === "1";
}

export function localized(fd: FormData, name: string): LocalizedText {
  return { ru: str(fd, `${name}.ru`), ky: str(fd, `${name}.ky`) };
}

/** Многострочное поле → массив { ru, ky } (строки двух языков сопоставляются по порядку). */
export function localizedLines(fd: FormData, name: string): LocalizedText[] {
  const ru = str(fd, `${name}.ru`).split("\n").map((s) => s.trim()).filter(Boolean);
  const ky = str(fd, `${name}.ky`).split("\n").map((s) => s.trim());
  return ru.map((line, i) => ({ ru: line, ky: ky[i] ?? "" }));
}

export function file(fd: FormData, name: string): File | null {
  const v = fd.get(name);
  return v instanceof File && v.size > 0 ? v : null;
}

export type FormState = { ok?: boolean; message?: string; errors?: Record<string, string> };
