/**
 * Ячейки сетки, которые занимает запись. Каждая ячейка — строка BookedSlot
 * с уникальным (doctorId, slotStart): две пересекающиеся записи к одному врачу
 * физически не могут оказаться в БД одновременно.
 *
 * Ячейки выравниваются по сетке GRID_MINUTES от полуночи UTC, поэтому не зависят
 * от настройки шага слотов: даже если шаг поменяют, гарантия сохранится.
 */
export const GRID_MINUTES = 5;

const GRID_MS = GRID_MINUTES * 60_000;

export function cellStarts(start: Date, end: Date): Date[] {
  const out: Date[] = [];
  const first = Math.floor(start.getTime() / GRID_MS) * GRID_MS;
  for (let t = first; t < end.getTime(); t += GRID_MS) out.push(new Date(t));
  return out;
}
