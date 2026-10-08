import { addDays, formatDateLong, toDateKey } from "./time";

/** «Сегодня», «Завтра» или «среда, 14 октября» — по времени клиники. */
export function relativeDayLabel(
  instant: Date,
  locale: string,
  labels: { today: string; tomorrow: string },
  now: Date,
): string {
  const key = toDateKey(instant);
  const today = toDateKey(now);
  if (key === today) return labels.today;
  if (key === addDays(today, 1)) return labels.tomorrow;
  return formatDateLong(instant, locale);
}
