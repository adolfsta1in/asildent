"use server";

import { revalidatePath, updateTag } from "next/cache";
import { bool, int, localized, str, type FormState } from "@/lib/admin/form";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS } from "@/lib/cache-tags";
import { db } from "@/lib/db";
import { syncTwoGisReviews } from "@/lib/reviews/sync";

function invalidate() {
  updateTag(TAGS.content);
  revalidatePath("/admin/content");
}

export async function saveReview(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(fd, "id") || null;
  const authorName = str(fd, "authorName");
  const text = localized(fd, "text");
  if (authorName.length < 2 || text.ru.length < 10) return { message: "Укажите автора и текст отзыва" };
  const serviceName = localized(fd, "serviceName");
  const data = {
    authorName,
    text,
    serviceName: serviceName.ru ? serviceName : undefined,
    rating: Math.min(5, Math.max(1, int(fd, "rating", 5))),
    isPublished: bool(fd, "isPublished"),
    isDemo: bool(fd, "isDemo"),
  };
  if (id) await db.review.update({ where: { id }, data });
  else {
    const max = await db.review.aggregate({ _max: { sortOrder: true } });
    await db.review.create({ data: { ...data, sortOrder: (max._max.sortOrder ?? 0) + 1 } });
  }
  invalidate();
  return { ok: true, message: id ? "Отзыв сохранён" : "Отзыв добавлен" };
}

export async function deleteReview(id: string): Promise<void> {
  await requireAdmin();
  await db.review.delete({ where: { id } });
  invalidate();
}

export async function saveFaq(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(fd, "id") || null;
  const question = localized(fd, "question");
  const answer = localized(fd, "answer");
  if (question.ru.length < 3 || answer.ru.length < 3) return { message: "Заполните вопрос и ответ" };
  if (id) await db.faq.update({ where: { id }, data: { question, answer } });
  else {
    const max = await db.faq.aggregate({ _max: { sortOrder: true } });
    await db.faq.create({ data: { question, answer, sortOrder: (max._max.sortOrder ?? 0) + 1 } });
  }
  invalidate();
  return { ok: true, message: id ? "Вопрос сохранён" : "Вопрос добавлен" };
}

export async function deleteFaq(id: string): Promise<void> {
  await requireAdmin();
  await db.faq.delete({ where: { id } });
  invalidate();
}

async function move(model: "review" | "faq", id: string, direction: -1 | 1) {
  await requireAdmin();
  const list =
    model === "review"
      ? await db.review.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true } })
      : await db.faq.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true } });
  const i = list.findIndex((x) => x.id === id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  await db.$transaction(
    list.map((x, idx) =>
      model === "review"
        ? db.review.update({ where: { id: x.id }, data: { sortOrder: idx } })
        : db.faq.update({ where: { id: x.id }, data: { sortOrder: idx } }),
    ),
  );
  invalidate();
}

export async function moveReview(id: string, direction: -1 | 1) {
  return move("review", id, direction);
}

export async function moveFaq(id: string, direction: -1 | 1) {
  return move("faq", id, direction);
}

/** Кнопка «Обновить из 2GIS» в админке — то же, что ежедневный cron. */
export async function syncReviewsFromTwoGis(): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  try {
    const { total, added, hidden } = await syncTwoGisReviews();
    invalidate();
    return { ok: true, message: `Отзывов на 5★ в 2GIS: ${total}. Новых: ${added}${hidden ? `, снято с публикации: ${hidden}` : ""}` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Не удалось загрузить отзывы" };
  }
}
