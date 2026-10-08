import { TZDate } from "@date-fns/tz";

/** Часовой пояс клиники. Все расчёты слотов и отображение времени — только в нём. */
export const CLINIC_TIME_ZONE = "Asia/Bishkek";

/** Дата в формате YYYY-MM-DD (календарная дата по времени клиники). */
export type DateKey = string;

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isDateKey(value: string): value is DateKey {
  if (!DATE_KEY_RE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const probe = new Date(Date.UTC(y, m - 1, d));
  return probe.getUTCFullYear() === y && probe.getUTCMonth() === m - 1 && probe.getUTCDate() === d;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Календарная дата момента времени в часовом поясе tz. */
export function toDateKey(instant: Date | number, tz: string = CLINIC_TIME_ZONE): DateKey {
  const z = new TZDate(typeof instant === "number" ? instant : instant.getTime(), tz);
  return `${z.getFullYear()}-${pad(z.getMonth() + 1)}-${pad(z.getDate())}`;
}

/** Минуты от полуночи (по времени клиники) для момента времени. */
export function toMinutesOfDay(instant: Date | number, tz: string = CLINIC_TIME_ZONE): number {
  const z = new TZDate(typeof instant === "number" ? instant : instant.getTime(), tz);
  return z.getHours() * 60 + z.getMinutes();
}

/** Перевод «дата + минуты от полуночи по времени клиники» в абсолютный момент (UTC). */
export function zonedToUtc(dateKey: DateKey, minutes: number, tz: string = CLINIC_TIME_ZONE): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(new TZDate(y, m - 1, d, 0, minutes, tz).getTime());
}

/** День недели даты: 0 — воскресенье … 6 — суббота. От часового пояса не зависит. */
export function weekdayOf(dateKey: DateKey): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function addDays(dateKey: DateKey, days: number): DateKey {
  const [y, m, d] = dateKey.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/** Все даты от from до to включительно. */
export function eachDateKey(from: DateKey, to: DateKey): DateKey[] {
  const out: DateKey[] = [];
  for (let k = from; k <= to; k = addDays(k, 1)) out.push(k);
  return out;
}

export function minutesToHHMM(minutes: number): string {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

export function hhmmToMinutes(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

/** «14:30» по времени клиники. */
export function formatTime(instant: Date | number): string {
  return minutesToHHMM(toMinutesOfDay(instant));
}

const INTL_LOCALE: Record<string, string> = { ru: "ru-RU", ky: "ky-KG" };

/** «среда, 7 октября» по времени клиники. */
export function formatDateLong(instant: Date | number | DateKey, locale: string): string {
  const date = typeof instant === "string" ? zonedToUtc(instant, 12 * 60) : instant;
  return new Intl.DateTimeFormat(INTL_LOCALE[locale] ?? "ru-RU", {
    timeZone: CLINIC_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

/** «07.10.2026» по времени клиники. */
export function formatDateShort(instant: Date | number | DateKey): string {
  const key = typeof instant === "string" ? instant : toDateKey(instant);
  const [y, m, d] = key.split("-");
  return `${d}.${m}.${y}`;
}
