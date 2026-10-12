"use client";

import { Check, ChevronDown, Flag, Link2, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useOptimistic, useState, useTransition } from "react";
import { deleteTask, saveTask, setTaskDone } from "@/app/admin/(panel)/tasks/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FormState } from "@/lib/admin/form";
import { formatDateShort, minutesToHHMM } from "@/lib/time";
import { cn } from "@/lib/utils";
import { useFormToast } from "../form-ui";

export type TaskView = {
  id: string;
  title: string;
  note: string | null;
  dueDate: string | null;
  dueMin: number | null;
  priority: string;
  isDone: boolean;
  appointment: { id: string; label: string } | null;
};

// ── Форма ────────────────────────────────────────────────────────────────────

/**
 * Добавление (и редактирование) задачи. В свёрнутом виде — одна строка «Что сделать?» + Enter;
 * срок, время, важность и заметка раскрываются по кнопке.
 */
export function TaskForm({
  today,
  task,
  appointmentId,
  defaultTitle,
  placeholder = "Что нужно сделать? Например: перезвонить Айгерим",
  onDone,
}: {
  today: string;
  task?: TaskView;
  appointmentId?: string;
  defaultTitle?: string;
  placeholder?: string;
  onDone?: () => void;
}) {
  const [expanded, setExpanded] = useState(Boolean(task));
  const [state, action, pending] = useActionState<FormState, FormData>(async (p, fd) => {
    const res = await saveTask(p, fd);
    if (res.ok) {
      if (!task) setExpanded(false);
      onDone?.();
    }
    return res;
  }, {});
  useFormToast(state);
  const e = state.errors ?? {};
  const key = task?.id ?? appointmentId ?? "new";

  return (
    <form action={action} className="space-y-3">
      {task && <input type="hidden" name="id" value={task.id} />}
      {appointmentId && <input type="hidden" name="appointmentId" value={appointmentId} />}
      <div className="flex gap-2">
        <label htmlFor={`title-${key}`} className="sr-only">
          Задача
        </label>
        <Input
          id={`title-${key}`}
          name="title"
          required
          minLength={2}
          maxLength={200}
          defaultValue={task?.title ?? defaultTitle}
          placeholder={placeholder}
          aria-invalid={Boolean(e.title)}
          className="h-11 flex-1"
        />
        {!task && (
          <Button type="button" variant="outline" className="h-11 shrink-0" onClick={() => setExpanded((x) => !x)} aria-expanded={expanded}>
            <span className="hidden sm:inline">Срок</span>
            <ChevronDown className={cn("transition-transform", expanded && "rotate-180")} />
          </Button>
        )}
        {!task && (
          <Button type="submit" className="h-11 shrink-0" disabled={pending} aria-label="Добавить задачу">
            <Plus /> <span className="hidden sm:inline">Добавить</span>
          </Button>
        )}
      </div>
      <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-[10rem_7rem_1fr]", !expanded && "hidden")}>
        <div>
          <label htmlFor={`date-${key}`} className="mb-1 block text-xs font-semibold text-muted-foreground">
            Дата
          </label>
          <Input id={`date-${key}`} name="dueDate" type="date" defaultValue={task ? (task.dueDate ?? "") : today} className="h-10" />
        </div>
        <div>
          <label htmlFor={`time-${key}`} className="mb-1 block text-xs font-semibold text-muted-foreground">
            Время
          </label>
          <Input id={`time-${key}`} name="dueTime" type="time" defaultValue={task?.dueMin != null ? minutesToHHMM(task.dueMin) : ""} className="h-10" />
        </div>
        <label className="col-span-2 flex items-center gap-2 self-end rounded-xl border px-3 py-2.5 text-sm sm:col-span-1">
          <input type="checkbox" name="important" defaultChecked={task?.priority === "high"} className="size-4 accent-[var(--destructive)]" />
          <Flag className="size-4 text-destructive" aria-hidden /> Важная
        </label>
        <div className="col-span-2 sm:col-span-3">
          <label htmlFor={`note-${key}`} className="mb-1 block text-xs font-semibold text-muted-foreground">
            Заметка
          </label>
          <Textarea id={`note-${key}`} name="note" rows={2} maxLength={2000} defaultValue={task?.note ?? ""} placeholder="Детали, номер телефона, что сказать…" />
        </div>
      </div>
      {!task && expanded && <p className="text-xs text-muted-foreground">Без даты — задача попадёт в «Без срока».</p>}
      {task && (
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onDone}>
            Отмена
          </Button>
          <Button type="submit" disabled={pending}>
            Сохранить
          </Button>
        </div>
      )}
    </form>
  );
}

// ── Список ───────────────────────────────────────────────────────────────────

export function TaskGroups({
  groups,
  today,
  showAppointment = true,
}: {
  groups: { key: string; label: string; tasks: TaskView[] }[];
  today: string;
  showAppointment?: boolean;
}) {
  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <section key={g.key} aria-labelledby={`tg-${g.key}`}>
          <h2 id={`tg-${g.key}`} className={cn("mb-2 flex items-center gap-2 text-sm font-bold tracking-wide uppercase", g.key === "overdue" ? "text-destructive" : "text-muted-foreground")}>
            {g.label}
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{g.tasks.length}</span>
          </h2>
          <TaskList tasks={g.tasks} today={today} showAppointment={showAppointment} />
        </section>
      ))}
    </div>
  );
}

export function TaskList({ tasks, today, showAppointment = true }: { tasks: TaskView[]; today: string; showAppointment?: boolean }) {
  return (
    <ul className="divide-y rounded-2xl border bg-card">
      {tasks.map((t) => (
        <TaskItem key={t.id} task={t} today={today} showAppointment={showAppointment} />
      ))}
    </ul>
  );
}

function dueLabel(t: TaskView, today: string): string | null {
  if (!t.dueDate) return null;
  const time = t.dueMin != null ? minutesToHHMM(t.dueMin) : "";
  // Сегодня — достаточно времени; остальные — дата
  if (t.dueDate === today) return time || "сегодня";
  return [formatDateShort(t.dueDate), time].filter(Boolean).join(", ");
}

function TaskItem({ task, today, showAppointment }: { task: TaskView; today: string; showAppointment: boolean }) {
  const [editing, setEditing] = useState(false);
  // Галочка меняется сразу, сервер догоняет; при ошибке вернётся значение с сервера
  const [done, setDone] = useOptimistic(task.isDone);
  const [pending, startTransition] = useTransition();
  const overdue = !done && task.dueDate !== null && task.dueDate < today;
  const due = dueLabel(task, today);

  if (editing) {
    return (
      <li className="p-3 sm:p-4">
        <TaskForm today={today} task={task} onDone={() => setEditing(false)} />
      </li>
    );
  }

  return (
    <li className={cn("group flex items-start gap-3 p-3 sm:px-4", pending && "opacity-60")}>
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={done ? `Вернуть в работу: ${task.title}` : `Выполнено: ${task.title}`}
        disabled={pending}
        onClick={() => {
          const next = !done;
          startTransition(async () => {
            setDone(next);
            await setTaskDone(task.id, next);
          });
        }}
        className={cn(
          "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          done ? "border-primary bg-primary text-primary-foreground" : "border-input hover:border-primary",
        )}
      >
        {done && <Check className="size-3.5" strokeWidth={3} />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("leading-snug font-medium text-ink", done && "text-muted-foreground line-through")}>
          {task.priority === "high" && !done && <Flag className="mr-1.5 inline size-3.5 -translate-y-px text-destructive" aria-label="Важная" />}
          {task.title}
        </p>
        {task.note && <p className="mt-0.5 text-sm whitespace-pre-line text-muted-foreground">{task.note}</p>}
        {(due || (showAppointment && task.appointment)) && (
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            {due && <span className={cn("font-semibold", overdue ? "text-destructive" : "text-muted-foreground")}>{due}</span>}
            {showAppointment && task.appointment && (
              <Link href={`/admin/appointments/${task.appointment.id}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                <Link2 className="size-3" aria-hidden /> {task.appointment.label}
              </Link>
            )}
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-0.5 sm:opacity-0 sm:transition-opacity sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Изменить: ${task.title}`} onClick={() => setEditing(true)}>
          <Pencil />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Удалить: ${task.title}`}
          disabled={pending}
          onClick={() => confirm("Удалить задачу?") && startTransition(() => deleteTask(task.id))}
        >
          <Trash2 />
        </Button>
      </div>
    </li>
  );
}
