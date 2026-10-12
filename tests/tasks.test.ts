import { describe, expect, it } from "vitest";
import { groupTasks, taskGroup } from "@/lib/admin/tasks";

const t = (id: string, dueDate: string | null, extra: { dueMin?: number; priority?: string; created?: number } = {}) => ({
  id,
  dueDate,
  dueMin: extra.dueMin ?? null,
  priority: extra.priority ?? "normal",
  createdAt: new Date(extra.created ?? 0),
});

describe("tasks", () => {
  const today = "2026-10-12";

  it("раскладывает по срокам", () => {
    expect(taskGroup(t("a", "2026-10-11"), today)).toBe("overdue");
    expect(taskGroup(t("a", today), today)).toBe("today");
    expect(taskGroup(t("a", "2026-10-13"), today)).toBe("tomorrow");
    expect(taskGroup(t("a", "2026-11-01"), today)).toBe("later");
    expect(taskGroup(t("a", null), today)).toBe("noDate");
  });

  it("сортирует: по времени, без времени — в конце, важные выше", () => {
    const groups = groupTasks(
      [
        t("no-time", today),
        t("late", today, { dueMin: 17 * 60 }),
        t("early", today, { dueMin: 9 * 60 }),
        t("no-time-high", today, { priority: "high" }),
        t("old", "2026-10-01"),
        t("none", null),
      ],
      today,
    );
    expect(groups.map((g) => g.key)).toEqual(["overdue", "today", "noDate"]);
    expect(groups[1].tasks.map((x) => x.id)).toEqual(["early", "late", "no-time-high", "no-time"]);
  });
});
