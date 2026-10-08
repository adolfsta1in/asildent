import { describe, expect, it } from "vitest";
import {
  availableDates,
  bookingWindow,
  computeDoctorSlots,
  computeMergedSlots,
  isSlotAvailable,
  pickLeastLoadedDoctor,
  workingMinutes,
  type DoctorAvailability,
  type SlotOptions,
} from "@/lib/slots/engine";
import { formatTime, hhmmToMinutes, toDateKey, zonedToUtc } from "@/lib/time";

// 2026-10-12 — понедельник, 2026-10-13 — вторник, 2026-10-11 — воскресенье.
const MON = "2026-10-12";
const TUE = "2026-10-13";
const SUN = "2026-10-11";

const m = hhmmToMinutes;
const at = (date: string, time: string) => zonedToUtc(date, m(time));
const times = (slots: Array<{ start: Date }>) => slots.map((s) => formatTime(s.start));

function doctor(partial: Partial<DoctorAvailability> = {}): DoctorAvailability {
  return {
    doctorId: "d1",
    rules: [{ weekday: 1, startMin: m("09:00"), endMin: m("12:00") }],
    exceptions: [],
    busy: [],
    ...partial,
  };
}

function opts(partial: Partial<SlotOptions> = {}): SlotOptions {
  return {
    durationMin: 60,
    stepMin: 30,
    // Воскресенье 06:00 по Бишкеку — заранее до понедельника.
    now: at(SUN, "06:00"),
    leadMin: 0,
    horizonDays: 30,
    from: MON,
    to: MON,
    ...partial,
  };
}

describe("часовой пояс", () => {
  it("09:00 по Бишкеку — это 03:00 UTC", () => {
    expect(at(MON, "09:00").toISOString()).toBe("2026-10-12T03:00:00.000Z");
  });

  it("дата считается по Бишкеку, а не по UTC", () => {
    // 23:30 UTC воскресенья = 05:30 понедельника в Бишкеке.
    expect(toDateKey(new Date("2026-10-11T23:30:00Z"))).toBe(MON);
    expect(toDateKey(new Date("2026-10-11T17:59:00Z"))).toBe(SUN);
  });

  it("корректно работает в поясе с переходом на летнее время", () => {
    const rules = [{ weekday: 0, startMin: m("09:00"), endMin: m("10:00") }];
    const base = { durationMin: 60, stepMin: 60, leadMin: 0, horizonDays: 30, tz: "Europe/Berlin" };
    // 29.03.2026 в Берлине переход на CEST (UTC+2), неделей раньше — CET (UTC+1).
    const afterDst = computeDoctorSlots(doctor({ rules }), {
      ...base,
      now: new Date("2026-03-28T00:00:00Z"),
      from: "2026-03-29",
      to: "2026-03-29",
    });
    expect(afterDst[0].start.toISOString()).toBe("2026-03-29T07:00:00.000Z");

    const beforeDst = computeDoctorSlots(doctor({ rules }), {
      ...base,
      now: new Date("2026-03-21T00:00:00Z"),
      from: "2026-03-22",
      to: "2026-03-22",
    });
    expect(beforeDst[0].start.toISOString()).toBe("2026-03-22T08:00:00.000Z");
  });
});

describe("рабочие часы и перерывы", () => {
  it("строит слоты с шагом, и последний слот заканчивается ровно в конце смены", () => {
    const slots = computeDoctorSlots(doctor(), opts());
    expect(times(slots)).toEqual(["09:00", "09:30", "10:00", "10:30", "11:00"]);
    expect(slots.at(-1)!.end.getTime()).toBe(at(MON, "12:00").getTime());
  });

  it("исключает слоты, пересекающие перерыв", () => {
    const d = doctor({
      rules: [{ weekday: 1, startMin: m("09:00"), endMin: m("16:00"), breakStartMin: m("13:00"), breakEndMin: m("14:00") }],
    });
    const result = times(computeDoctorSlots(d, opts()));
    expect(result).toContain("12:00");
    expect(result).not.toContain("12:30");
    expect(result).not.toContain("13:00");
    expect(result).not.toContain("13:30");
    expect(result).toContain("14:00");
    expect(result.at(-1)).toBe("15:00");
  });

  it("длинная услуга не влезает перед перерывом", () => {
    const d = doctor({
      rules: [{ weekday: 1, startMin: m("09:00"), endMin: m("18:00"), breakStartMin: m("13:00"), breakEndMin: m("14:00") }],
    });
    const result = times(computeDoctorSlots(d, opts({ durationMin: 90 })));
    expect(result).toContain("11:30"); // 11:30–13:00
    expect(result).not.toContain("12:00"); // 12:00–13:30 задевает перерыв
    expect(result).toContain("14:00");
    expect(result.at(-1)).toBe("16:30"); // 16:30–18:00
  });

  it("услуга длиннее смены — слотов нет", () => {
    expect(computeDoctorSlots(doctor(), opts({ durationMin: 240 }))).toEqual([]);
  });

  it("выравнивает слоты по сетке шага, если смена начинается не ровно", () => {
    const d = doctor({ rules: [{ weekday: 1, startMin: m("09:10"), endMin: m("10:30") }] });
    expect(times(computeDoctorSlots(d, opts({ durationMin: 30, stepMin: 15 })))).toEqual([
      "09:15",
      "09:30",
      "09:45",
      "10:00",
    ]);
  });

  it("в день недели без графика слотов нет", () => {
    expect(computeDoctorSlots(doctor(), opts({ from: TUE, to: TUE }))).toEqual([]);
  });

  it("игнорирует некорректный перерыв за пределами смены", () => {
    const d = doctor({
      rules: [{ weekday: 1, startMin: m("09:00"), endMin: m("11:00"), breakStartMin: m("12:00"), breakEndMin: m("13:00") }],
    });
    expect(workingMinutes(MON, d.rules, [])).toEqual([[m("09:00"), m("11:00")]]);
  });
});

describe("исключения из графика", () => {
  it("выходной (DAY_OFF) убирает все слоты дня", () => {
    const d = doctor({ exceptions: [{ date: MON, type: "DAY_OFF" }] });
    expect(computeDoctorSlots(d, opts())).toEqual([]);
  });

  it("особые часы заменяют шаблон недели", () => {
    const d = doctor({ exceptions: [{ date: MON, type: "CUSTOM_HOURS", startMin: m("14:00"), endMin: m("16:00") }] });
    expect(times(computeDoctorSlots(d, opts()))).toEqual(["14:00", "14:30", "15:00"]);
  });

  it("особые часы работают даже в день, когда по шаблону выходной", () => {
    const d = doctor({ exceptions: [{ date: TUE, type: "CUSTOM_HOURS", startMin: m("10:00"), endMin: m("11:00") }] });
    expect(times(computeDoctorSlots(d, opts({ from: TUE, to: TUE })))).toEqual(["10:00"]);
  });

  it("особые часы с собственным перерывом", () => {
    const d = doctor({
      exceptions: [
        {
          date: MON,
          type: "CUSTOM_HOURS",
          startMin: m("10:00"),
          endMin: m("13:00"),
          breakStartMin: m("11:00"),
          breakEndMin: m("12:00"),
        },
      ],
    });
    expect(times(computeDoctorSlots(d, opts()))).toEqual(["10:00", "12:00"]);
  });

  it("исключение на другую дату не влияет на текущую", () => {
    const d = doctor({ exceptions: [{ date: TUE, type: "DAY_OFF" }] });
    expect(computeDoctorSlots(d, opts())).toHaveLength(5);
  });
});

describe("пересечения с существующими записями", () => {
  const busy = [{ start: at(MON, "10:00").getTime(), end: at(MON, "10:45").getTime() }];

  it("убирает все слоты, пересекающиеся с записью, но не соседние", () => {
    const result = times(computeDoctorSlots(doctor({ busy }), opts({ durationMin: 30, stepMin: 15 })));
    expect(result).toContain("09:30"); // 09:30–10:00 — касается, но не пересекает
    expect(result).not.toContain("09:45");
    expect(result).not.toContain("10:00");
    expect(result).not.toContain("10:15");
    expect(result).not.toContain("10:30");
    expect(result).toContain("10:45"); // начинается ровно в конце записи
  });

  it("длинная услуга не перекрывает следующую запись", () => {
    const later = [{ start: at(MON, "11:00").getTime(), end: at(MON, "11:30").getTime() }];
    const result = times(computeDoctorSlots(doctor({ busy: later }), opts({ durationMin: 90, stepMin: 30 })));
    expect(result).toEqual(["09:00", "09:30"]); // 09:30–11:00 ещё можно, 10:00–11:30 уже нет
  });

  it("запись другого дня не мешает", () => {
    const other = [{ start: at(TUE, "09:00").getTime(), end: at(TUE, "12:00").getTime() }];
    expect(computeDoctorSlots(doctor({ busy: other }), opts())).toHaveLength(5);
  });
});

describe("минимальный отступ и горизонт", () => {
  it("не показывает прошедшее время и учитывает минимальный отступ", () => {
    const now = at(MON, "09:20");
    const result = times(computeDoctorSlots(doctor(), opts({ now, leadMin: 60, durationMin: 30, stepMin: 15 })));
    expect(result[0]).toBe("10:30"); // 09:20 + 60 мин = 10:20 → ближайший по сетке 10:30
  });

  it("без отступа — первый слот не раньше текущего момента", () => {
    const now = at(MON, "10:00");
    expect(times(computeDoctorSlots(doctor(), opts({ now })))[0]).toBe("10:00");
  });

  it("не отдаёт даты в прошлом", () => {
    const now = at(TUE, "08:00");
    expect(computeDoctorSlots(doctor(), opts({ now, from: MON, to: MON }))).toEqual([]);
  });

  it("ограничивает диапазон горизонтом записи", () => {
    const d = doctor({
      rules: [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, startMin: m("09:00"), endMin: m("10:00") })),
    });
    const slots = computeDoctorSlots(d, opts({ now: at(MON, "06:00"), horizonDays: 3, from: MON, to: "2026-10-30" }));
    expect(availableDates(slots)).toEqual([MON, TUE, "2026-10-14"]);
  });

  it("окно записи: сегодня + (горизонт − 1) дней", () => {
    expect(bookingWindow(at(MON, "06:00"), 30)).toEqual({ first: MON, last: "2026-11-10" });
  });
});

describe("граница суток", () => {
  it("«сегодня» определяется по Бишкеку: в 23:30 UTC воскресенья уже понедельник", () => {
    const now = new Date("2026-10-11T23:30:00Z"); // 05:30 понедельника по Бишкеку
    const slots = computeDoctorSlots(doctor(), opts({ now, leadMin: 120, from: SUN, to: MON }));
    expect(availableDates(slots)).toEqual([MON]);
    expect(times(slots)[0]).toBe("09:00");
  });

  it("смена до полуночи: последний слот заканчивается в 24:00", () => {
    const d = doctor({ rules: [{ weekday: 1, startMin: m("22:00"), endMin: 24 * 60 }] });
    const slots = computeDoctorSlots(d, opts());
    expect(times(slots)).toEqual(["22:00", "22:30", "23:00"]);
    expect(slots.at(-1)!.end.toISOString()).toBe("2026-10-12T18:00:00.000Z"); // 00:00 вторника по Бишкеку
  });

  it("ночные слоты относятся к дате по Бишкеку, хотя в UTC это предыдущий день", () => {
    const d = doctor({ rules: [{ weekday: 2, startMin: m("00:00"), endMin: m("01:00") }] });
    const slots = computeDoctorSlots(d, opts({ from: TUE, to: TUE }));
    expect(slots[0].start.toISOString()).toBe("2026-10-12T18:00:00.000Z");
    expect(availableDates(slots)).toEqual([TUE]);
  });
});

describe("любой свободный врач", () => {
  const d1 = doctor({ doctorId: "d1" });
  const d2 = doctor({
    doctorId: "d2",
    rules: [{ weekday: 1, startMin: m("10:00"), endMin: m("13:00") }],
    busy: [{ start: at(MON, "11:00").getTime(), end: at(MON, "12:00").getTime() }],
  });

  it("объединяет слоты по времени и перечисляет свободных врачей", () => {
    const merged = computeMergedSlots([d1, d2], opts());
    expect(times(merged)).toEqual(["09:00", "09:30", "10:00", "10:30", "11:00", "12:00"]);
    expect(merged.find((s) => formatTime(s.start) === "10:00")!.doctorIds).toEqual(["d1", "d2"]);
    expect(merged.find((s) => formatTime(s.start) === "11:00")!.doctorIds).toEqual(["d1"]);
    expect(merged.find((s) => formatTime(s.start) === "12:00")!.doctorIds).toEqual(["d2"]);
  });

  it("выбирает наименее загруженного врача, при равенстве — первого", () => {
    expect(pickLeastLoadedDoctor(["d1", "d2"], new Map([["d1", 3], ["d2", 1]]))).toBe("d2");
    expect(pickLeastLoadedDoctor(["d1", "d2"], new Map())).toBe("d1");
  });
});

describe("проверка конкретного слота", () => {
  const base = { durationMin: 60, stepMin: 30, now: at(SUN, "06:00"), leadMin: 0, horizonDays: 30 };

  it("свободный слот доступен", () => {
    expect(isSlotAvailable(doctor(), at(MON, "10:00"), base)).toBe(true);
  });

  it("слот не по сетке недоступен", () => {
    expect(isSlotAvailable(doctor(), at(MON, "10:10"), base)).toBe(false);
  });

  it("занятый слот недоступен", () => {
    const d = doctor({ busy: [{ start: at(MON, "10:30").getTime(), end: at(MON, "11:00").getTime() }] });
    expect(isSlotAvailable(d, at(MON, "10:00"), base)).toBe(false);
  });
});
