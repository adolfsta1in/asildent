import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/admin/page-title";
import { TaskForm, TaskGroups, TaskList } from "@/components/admin/tasks/tasks-ui";
import { todayKey } from "@/lib/admin/appointments";
import { groupTasks, TASK_GROUP_LABELS } from "@/lib/admin/tasks";
import { taskInclude, toTaskView } from "@/lib/admin/tasks-db";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Задачи" };

export default async function TasksPage({ searchParams }: PageProps<"/admin/tasks">) {
  const sp = await searchParams;
  const showDone = sp.view === "done";
  const today = await todayKey();
  const [open, done, openCount] = await Promise.all([
    showDone ? Promise.resolve([]) : db.task.findMany({ where: { isDone: false }, include: taskInclude }),
    showDone ? db.task.findMany({ where: { isDone: true }, include: taskInclude, orderBy: { doneAt: "desc" }, take: 100 }) : Promise.resolve([]),
    db.task.count({ where: { isDone: false } }),
  ]);
  const groups = groupTasks(open, today).map((g) => ({ key: g.key, label: TASK_GROUP_LABELS[g.key], tasks: g.tasks.map(toTaskView) }));

  const tab = "rounded-full px-4 py-2 text-sm font-semibold transition-colors";
  return (
    <div className="max-w-3xl">
      <PageTitle title="Задачи" description="Перезвонить, напомнить, заказать материалы — всё, что нельзя забыть." />
      <div className="rounded-3xl border bg-card p-4 sm:p-5">
        <TaskForm today={today} />
      </div>

      <nav aria-label="Фильтр задач" className="mt-6 mb-4 flex gap-1">
        <Link href="/admin/tasks" aria-current={!showDone ? "page" : undefined} className={cn(tab, !showDone ? "bg-ink text-white" : "text-muted-foreground hover:bg-muted")}>
          В работе · {openCount}
        </Link>
        <Link href="/admin/tasks?view=done" aria-current={showDone ? "page" : undefined} className={cn(tab, showDone ? "bg-ink text-white" : "text-muted-foreground hover:bg-muted")}>
          Выполненные
        </Link>
      </nav>

      {showDone ? (
        done.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">Выполненных задач пока нет</p>
        ) : (
          <TaskList tasks={done.map(toTaskView)} today={today} />
        )
      ) : groups.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">Всё сделано — новых задач нет</p>
      ) : (
        <TaskGroups groups={groups} today={today} />
      )}
    </div>
  );
}
