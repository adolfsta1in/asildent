"use server";

import { revalidatePath } from "next/cache";
import { bool, str, type FormState } from "@/lib/admin/form";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { hhmmToMinutes, isDateKey } from "@/lib/time";

function invalidate() {
  // Задачи видны в разделе «Задачи», на сводке и в карточке записи
  revalidatePath("/admin", "layout");
}

/** Создать или изменить задачу. */
export async function saveTask(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(fd, "id") || null;
  const title = str(fd, "title");
  const note = str(fd, "note");
  const dueDate = str(fd, "dueDate");
  const dueTime = str(fd, "dueTime");
  const errors: Record<string, string> = {};
  if (title.length < 2) errors.title = "Напишите, что нужно сделать";
  if (title.length > 200) errors.title = "Слишком длинно — детали можно написать в заметке";
  if (note.length > 2000) errors.note = "Заметка слишком длинная";
  if (dueDate && !isDateKey(dueDate)) errors.dueDate = "Некорректная дата";
  if (dueTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(dueTime)) errors.dueTime = "Время в формате ЧЧ:ММ";
  if (dueTime && !dueDate) errors.dueTime = "Укажите и дату";
  const appointmentId = str(fd, "appointmentId") || null;
  if (appointmentId && !(await db.appointment.findUnique({ where: { id: appointmentId }, select: { id: true } }))) {
    errors.title = "Запись не найдена";
  }
  if (Object.keys(errors).length) return { errors, message: Object.values(errors)[0] };

  const data = {
    title,
    note: note || null,
    dueDate: dueDate || null,
    dueMin: dueTime ? hhmmToMinutes(dueTime) : null,
    priority: bool(fd, "important") ? "high" : "normal",
  };
  if (id) await db.task.update({ where: { id }, data });
  else await db.task.create({ data: { ...data, appointmentId } });
  invalidate();
  return { ok: true, message: id ? "Задача сохранена" : "Задача добавлена" };
}

export async function setTaskDone(id: string, done: boolean): Promise<void> {
  await requireAdmin();
  await db.task.update({ where: { id }, data: { isDone: done, doneAt: done ? new Date() : null } });
  invalidate();
}

export async function deleteTask(id: string): Promise<void> {
  await requireAdmin();
  await db.task.delete({ where: { id } });
  invalidate();
}
