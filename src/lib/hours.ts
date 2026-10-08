import type { WorkingHours } from "@/config/clinic";

export type HoursGroup = { days: number[]; hours: { open: string; close: string } | null };

const ORDER = [1, 2, 3, 4, 5, 6, 0];

/** Склеивает подряд идущие дни с одинаковыми часами: Пн–Пт 09:00–20:00. */
export function groupWorkingHours(wh: WorkingHours): HoursGroup[] {
  const groups: HoursGroup[] = [];
  for (const day of ORDER) {
    const h = wh[String(day) as keyof WorkingHours] ?? null;
    const last = groups.at(-1);
    const same =
      last &&
      ((last.hours === null && h === null) ||
        (last.hours && h && last.hours.open === h.open && last.hours.close === h.close));
    if (same) last.days.push(day);
    else groups.push({ days: [day], hours: h });
  }
  return groups;
}
