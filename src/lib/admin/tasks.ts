import { addDays, type DateKey } from "@/lib/time";

export type TaskGroupKey = "overdue" | "today" | "tomorrow" | "later" | "noDate";

export const TASK_GROUP_LABELS: Record<TaskGroupKey, string> = {
  overdue: "Просрочено",
  today: "Сегодня",
  tomorrow: "Завтра",
  later: "Позже",
  noDate: "Без срока",
};

type Groupable = { dueDate: string | null; dueMin: number | null; priority: string; createdAt: Date };

/** К какой группе относится открытая задача (по дате по Бишкеку). */
export function taskGroup(t: Pick<Groupable, "dueDate">, today: DateKey): TaskGroupKey {
  if (!t.dueDate) return "noDate";
  if (t.dueDate < today) return "overdue";
  if (t.dueDate === today) return "today";
  if (t.dueDate === addDays(today, 1)) return "tomorrow";
  return "later";
}

/** Порядок внутри группы: по дате и времени (без времени — в конце дня), важные выше, затем старые выше. */
export function compareTasks(a: Groupable, b: Groupable): number {
  return (
    (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999") ||
    (a.dueMin ?? 24 * 60) - (b.dueMin ?? 24 * 60) ||
    Number(b.priority === "high") - Number(a.priority === "high") ||
    a.createdAt.getTime() - b.createdAt.getTime()
  );
}

/** Открытые задачи по группам в порядке показа; пустые группы не возвращаются. */
export function groupTasks<T extends Groupable>(tasks: T[], today: DateKey): { key: TaskGroupKey; tasks: T[] }[] {
  const order: TaskGroupKey[] = ["overdue", "today", "tomorrow", "later", "noDate"];
  const sorted = [...tasks].sort(compareTasks);
  return order
    .map((key) => ({ key, tasks: sorted.filter((t) => taskGroup(t, today) === key) }))
    .filter((g) => g.tasks.length > 0);
}

/** Подпись привязанной записи в списке задач: «Айгерим · 14.10, 15:30». */
export function appointmentLabel(a: { patientName: string; startAt: Date }, fmt: { date: (d: Date) => string; time: (d: Date) => string }) {
  return `${a.patientName} · ${fmt.date(a.startAt)}, ${fmt.time(a.startAt)}`;
}
