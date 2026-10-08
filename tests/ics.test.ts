import { describe, expect, it } from "vitest";
import { buildIcs } from "@/lib/ics";

describe(".ics", () => {
  const ics = buildIcs({
    uid: "ABC123@clinic",
    start: new Date("2026-10-12T03:00:00Z"),
    end: new Date("2026-10-12T04:00:00Z"),
    title: "Лечение кариеса, Арча Дент",
    description: "Врач: Айгерим Асанова\nНомер записи: ABC123",
    location: "г. Бишкек, ул. Токтогула, 125",
    organizer: "Арча Дент",
  });

  it("содержит время в UTC и экранирует спецсимволы", () => {
    expect(ics).toContain("DTSTART:20261012T030000Z");
    expect(ics).toContain("DTEND:20261012T040000Z");
    expect(ics).toContain("SUMMARY:Лечение кариеса\\, Арча Дент");
    expect(ics).toContain("\\n");
  });

  it("использует CRLF и переносит длинные строки", () => {
    expect(ics.split("\r\n").every((l) => new TextEncoder().encode(l).length <= 75)).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });
});
