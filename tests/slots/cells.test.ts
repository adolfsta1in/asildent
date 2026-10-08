import { describe, expect, it } from "vitest";
import { cellStarts, GRID_MINUTES } from "@/lib/slots/cells";

const t = (iso: string) => new Date(`2026-10-12T${iso}:00.000Z`);
const MIN = 60_000;

function intersects(a: Date[], b: Date[]) {
  const set = new Set(a.map((d) => d.getTime()));
  return b.some((d) => set.has(d.getTime()));
}

describe("ячейки занятости (защита от двойной записи на уровне БД)", () => {
  it("запись на 60 минут занимает 60 / шаг сетки ячеек", () => {
    expect(cellStarts(t("03:00"), t("04:00"))).toHaveLength(60 / GRID_MINUTES);
  });

  it("соседние записи не делят ячейки", () => {
    expect(intersects(cellStarts(t("03:00"), t("04:00")), cellStarts(t("04:00"), t("04:30")))).toBe(false);
  });

  it("любые пересекающиеся записи всегда делят хотя бы одну ячейку", () => {
    // Перебор: записи разной длительности и со сдвигом начала, в т.ч. не кратным сетке.
    const base = t("03:00").getTime();
    for (let aStart = 0; aStart < 120; aStart += 1) {
      for (const aLen of [5, 15, 20, 30, 45, 60, 90]) {
        for (let bStart = 0; bStart < 120; bStart += 7) {
          for (const bLen of [15, 30, 60]) {
            const a1 = base + aStart * MIN;
            const a2 = a1 + aLen * MIN;
            const b1 = base + bStart * MIN;
            const b2 = b1 + bLen * MIN;
            const overlap = a1 < b2 && b1 < a2;
            if (!overlap) continue;
            const ok = intersects(
              cellStarts(new Date(a1), new Date(a2)),
              cellStarts(new Date(b1), new Date(b2)),
            );
            expect(ok, `A=${aStart}+${aLen} B=${bStart}+${bLen}`).toBe(true);
          }
        }
      }
    }
  });
});
