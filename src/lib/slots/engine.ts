/**
 * Движок расчёта свободных слотов. Чистые функции без БД и без «текущего времени»
 * внутри — всё передаётся аргументами, поэтому поведение полностью покрыто тестами.
 *
 * Свободный слот = график врача (шаблон недели или исключение на дату)
 *                  − перерыв
 *                  − существующие записи
 *                  − время раньше «сейчас + минимальный отступ»
 *                  − даты за горизонтом записи.
 */
import { addDays, CLINIC_TIME_ZONE, eachDateKey, toDateKey, weekdayOf, zonedToUtc, type DateKey } from "../time";

export type ScheduleRuleInput = {
  /** 0 — воскресенье … 6 — суббота */
  weekday: number;
  startMin: number;
  endMin: number;
  breakStartMin?: number | null;
  breakEndMin?: number | null;
};

export type ScheduleExceptionInput = {
  date: DateKey;
  type: "DAY_OFF" | "CUSTOM_HOURS";
  startMin?: number | null;
  endMin?: number | null;
  breakStartMin?: number | null;
  breakEndMin?: number | null;
};

/** Полуоткрытый интервал [start, end) в миллисекундах epoch. */
export type Interval = { start: number; end: number };

export type DoctorAvailability = {
  doctorId: string;
  rules: ScheduleRuleInput[];
  exceptions: ScheduleExceptionInput[];
  /** Занятые интервалы (активные записи врача). */
  busy: Interval[];
};

export type SlotOptions = {
  durationMin: number;
  stepMin: number;
  now: Date;
  leadMin: number;
  horizonDays: number;
  /** Диапазон дат (по времени клиники), включительно. */
  from: DateKey;
  to: DateKey;
  tz?: string;
};

export type Slot = { start: Date; end: Date; doctorId: string };
export type MergedSlot = { start: Date; end: Date; doctorIds: string[] };

const MIN = 60_000;

/** Рабочие интервалы (в минутах от полуночи) на дату с учётом исключений и перерыва. */
export function workingMinutes(
  date: DateKey,
  rules: ScheduleRuleInput[],
  exceptions: ScheduleExceptionInput[],
): Array<[number, number]> {
  const exception = exceptions.find((e) => e.date === date);
  let day: Omit<ScheduleRuleInput, "weekday"> | undefined;

  if (exception) {
    if (exception.type === "DAY_OFF") return [];
    if (exception.startMin == null || exception.endMin == null) return [];
    day = exception as Omit<ScheduleRuleInput, "weekday">;
  } else {
    day = rules.find((r) => r.weekday === weekdayOf(date));
  }
  if (!day || day.endMin <= day.startMin) return [];

  const { startMin, endMin, breakStartMin, breakEndMin } = day;
  const hasBreak =
    breakStartMin != null && breakEndMin != null && breakEndMin > breakStartMin && breakStartMin < endMin && breakEndMin > startMin;
  if (!hasBreak) return [[startMin, endMin]];

  const out: Array<[number, number]> = [];
  if (breakStartMin! > startMin) out.push([startMin, breakStartMin!]);
  if (breakEndMin! < endMin) out.push([breakEndMin!, endMin]);
  return out;
}

/** Даты, на которые вообще разрешена запись: от сегодня (по времени клиники) до горизонта. */
export function bookingWindow(now: Date, horizonDays: number, tz: string = CLINIC_TIME_ZONE) {
  const first = toDateKey(now, tz);
  return { first, last: addDays(first, Math.max(horizonDays, 1) - 1) };
}

function overlaps(aStart: number, aEnd: number, b: Interval) {
  return aStart < b.end && aEnd > b.start;
}

/** Свободные слоты одного врача. */
export function computeDoctorSlots(doctor: DoctorAvailability, opts: SlotOptions): Slot[] {
  const tz = opts.tz ?? CLINIC_TIME_ZONE;
  const { durationMin, stepMin } = opts;
  if (durationMin <= 0 || stepMin <= 0) return [];

  const window = bookingWindow(opts.now, opts.horizonDays, tz);
  const from = opts.from > window.first ? opts.from : window.first;
  const to = opts.to < window.last ? opts.to : window.last;
  if (from > to) return [];

  const earliest = opts.now.getTime() + opts.leadMin * MIN;
  const busy = [...doctor.busy].sort((a, b) => a.start - b.start);
  const slots: Slot[] = [];

  for (const date of eachDateKey(from, to)) {
    for (const [startMin, endMin] of workingMinutes(date, doctor.rules, doctor.exceptions)) {
      // Слоты выравниваются по «часовой» сетке шага: 09:00, 09:15… даже если смена начинается в 09:10.
      const firstMin = Math.ceil(startMin / stepMin) * stepMin;
      for (let m = firstMin; m + durationMin <= endMin; m += stepMin) {
        const start = zonedToUtc(date, m, tz).getTime();
        const end = start + durationMin * MIN;
        if (start < earliest) continue;
        if (busy.some((b) => overlaps(start, end, b))) continue;
        slots.push({ start: new Date(start), end: new Date(end), doctorId: doctor.doctorId });
      }
    }
  }
  return slots;
}

/** Слоты для нескольких врачей («любой свободный врач»): объединение по времени начала. */
export function computeMergedSlots(doctors: DoctorAvailability[], opts: SlotOptions): MergedSlot[] {
  const byStart = new Map<number, MergedSlot>();
  for (const d of doctors) {
    for (const s of computeDoctorSlots(d, opts)) {
      const key = s.start.getTime();
      const existing = byStart.get(key);
      if (existing) existing.doctorIds.push(s.doctorId);
      else byStart.set(key, { start: s.start, end: s.end, doctorIds: [s.doctorId] });
    }
  }
  return [...byStart.values()].sort((a, b) => a.start.getTime() - b.start.getTime());
}

/** Даты (по времени клиники), на которые есть хотя бы один свободный слот. */
export function availableDates(slots: Array<{ start: Date }>, tz: string = CLINIC_TIME_ZONE): DateKey[] {
  return [...new Set(slots.map((s) => toDateKey(s.start, tz)))].sort();
}

/** Проверка, что конкретный слот свободен у врача (используется при создании записи). */
export function isSlotAvailable(doctor: DoctorAvailability, start: Date, opts: Omit<SlotOptions, "from" | "to">): boolean {
  const tz = opts.tz ?? CLINIC_TIME_ZONE;
  const date = toDateKey(start, tz);
  return computeDoctorSlots(doctor, { ...opts, from: date, to: date }).some((s) => s.start.getTime() === start.getTime());
}

/**
 * Выбор врача для «любого свободного»: меньше всего записей в этот день,
 * при равенстве — порядок, в котором врачи переданы (сортировка в админке).
 */
export function pickLeastLoadedDoctor(candidates: string[], dayLoad: Map<string, number>): string | undefined {
  return [...candidates].sort((a, b) => (dayLoad.get(a) ?? 0) - (dayLoad.get(b) ?? 0))[0];
}
