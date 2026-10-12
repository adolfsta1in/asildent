"use server";

import { revalidatePath, updateTag } from "next/cache";
import { bool, file, localized, str, type FormState } from "@/lib/admin/form";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS } from "@/lib/cache-tags";
import { db } from "@/lib/db";
import { deleteImage, saveImage, UploadError } from "@/lib/storage";

function invalidate() {
  updateTag(TAGS.content);
  revalidatePath("/admin/cases");
}

/** Создать или изменить кейс «до и после». При изменении фото можно не загружать — останутся прежние. */
export async function saveCase(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(fd, "id") || null;
  const title = localized(fd, "title");
  const errors: Record<string, string> = {};
  if (title.ru.length < 2) errors.title = "Укажите название";
  const beforeFile = file(fd, "before");
  const afterFile = file(fd, "after");
  if (!id && !beforeFile) errors.before = "Загрузите фото «до»";
  if (!id && !afterFile) errors.after = "Загрузите фото «после»";
  const rawDoctor = str(fd, "doctorId");
  const doctorId = rawDoctor && rawDoctor !== "none" ? rawDoctor : null;
  if (doctorId && !(await db.doctor.findUnique({ where: { id: doctorId }, select: { id: true } }))) errors.doctorId = "Врач не найден";
  if (Object.keys(errors).length) return { errors, message: "Проверьте поля формы" };

  const old = id ? await db.beforeAfterCase.findUnique({ where: { id } }) : null;
  if (id && !old) return { message: "Кейс не найден — обновите страницу" };

  let beforeUrl: string | undefined;
  let afterUrl: string | undefined;
  try {
    if (beforeFile) beforeUrl = await saveImage(beforeFile, "cases");
    if (afterFile) afterUrl = await saveImage(afterFile, "cases");
  } catch (e) {
    if (e instanceof UploadError) return { message: e.message };
    throw e;
  }

  const data = {
    title,
    description: localized(fd, "description"),
    doctorId,
    isPublished: bool(fd, "isPublished"),
    ...(beforeUrl ? { beforeUrl } : {}),
    ...(afterUrl ? { afterUrl } : {}),
  };

  if (old) {
    await db.beforeAfterCase.update({ where: { id: old.id }, data });
    if (beforeUrl) await deleteImage(old.beforeUrl);
    if (afterUrl) await deleteImage(old.afterUrl);
  } else {
    const max = await db.beforeAfterCase.aggregate({ _max: { sortOrder: true } });
    await db.beforeAfterCase.create({
      data: { ...data, beforeUrl: beforeUrl!, afterUrl: afterUrl!, sortOrder: (max._max.sortOrder ?? 0) + 1 },
    });
  }
  invalidate();
  return { ok: true, message: old ? "Кейс сохранён" : "Кейс добавлен" };
}

export async function deleteCase(id: string): Promise<void> {
  await requireAdmin();
  const c = await db.beforeAfterCase.delete({ where: { id } });
  await deleteImage(c.beforeUrl);
  await deleteImage(c.afterUrl);
  invalidate();
}

export async function moveCase(id: string, direction: -1 | 1): Promise<void> {
  await requireAdmin();
  const list = await db.beforeAfterCase.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true } });
  const i = list.findIndex((c) => c.id === id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  await db.$transaction(list.map((c, idx) => db.beforeAfterCase.update({ where: { id: c.id }, data: { sortOrder: idx } })));
  invalidate();
}
