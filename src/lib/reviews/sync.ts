import "server-only";
import { db } from "@/lib/db";
import { branchIdFromUrl, fetchTwoGisReviews, pickFiveStar } from "./twogis";

/**
 * Синхронизация отзывов 2GIS с базой: новые отзывы на 5 звёзд добавляются и сразу публикуются,
 * у существующих обновляются текст и имя (скрытие в админке сохраняется). Отзывы, которые в 2GIS
 * удалили или у которых оценка стала ниже 5, снимаются с публикации. Отзывы, добавленные вручную, не трогаются.
 */
export async function syncTwoGisReviews() {
  const settings = await db.clinicSettings.findFirst({ select: { twoGisUrl: true } });
  const branchId = branchIdFromUrl(settings?.twoGisUrl ?? "");
  if (!branchId) throw new Error("В настройках клиники не указана ссылка на 2GIS вида …/firm/<id>");

  const reviews = pickFiveStar(await fetchTwoGisReviews(branchId));
  const ids = reviews.map((r) => r.externalId);
  const existing = new Set(
    (await db.review.findMany({ where: { externalId: { in: ids } }, select: { externalId: true } })).map((r) => r.externalId),
  );

  let added = 0;
  for (const r of reviews) {
    const data = { authorName: r.authorName, text: { ru: r.text, ky: "" }, rating: r.rating, publishedAt: r.publishedAt };
    if (existing.has(r.externalId)) {
      await db.review.update({ where: { externalId: r.externalId }, data });
    } else {
      await db.review.create({ data: { ...data, externalId: r.externalId, source: "2gis", isDemo: false, isPublished: true } });
      added++;
    }
  }
  const { count: hidden } = await db.review.updateMany({
    where: { source: "2gis", externalId: { notIn: ids }, isPublished: true },
    data: { isPublished: false },
  });
  return { total: reviews.length, added, hidden };
}
