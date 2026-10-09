/**
 * Отзывы из 2GIS: загрузка и разбор. Синхронизация с базой — в ./sync.ts.
 *
 * Официального API отзывов у 2GIS нет. Это тот же публичный адрес, через который отзывы грузит сам
 * сайт 2gis.kg, и его ключ (reviewApiKey из настроек страницы). Если 2GIS сменит ключ или формат,
 * синхронизация упадёт с ошибкой, а отзывы на сайте останутся прежними.
 */

const API = "https://public-api.reviews.2gis.com/2.0";
const DEFAULT_KEY = "6e7e1929-4ea9-4a5d-8c05-d601860389bd";

/** Отзывы короче этого — «Всё отлично!» и т. п. — на сайт не берём. */
export const MIN_TEXT_LENGTH = 40;

export type TwoGisReview = {
  id: string;
  rating: number;
  text: string | null;
  date_created: string;
  is_hidden?: boolean;
  on_moderation?: boolean;
  user: { name: string };
};

export type ParsedReview = {
  externalId: string;
  authorName: string;
  text: string;
  rating: number;
  publishedAt: Date;
};

/** «Мека Умарова» → «Мека У.», «Аяр 52» → «Аяр», «beams marlen» → «Beams M.» */
export function shortName(name: string): string {
  const words = name
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{M}-]/gu, ""))
    .filter(Boolean);
  if (words.length === 0) return "Пациент";
  // «ЯСМИНА» → «Ясмина»; короткие вроде «NN» оставляем как есть
  const cap = (w: string) => w[0].toUpperCase() + (w.length > 3 && w === w.toUpperCase() ? w.slice(1).toLowerCase() : w.slice(1));
  const first = cap(words[0]);
  return words[1] ? `${first} ${words[1][0].toUpperCase()}.` : first;
}

/** Только видимые отзывы на 5 звёзд с нормальным текстом. */
export function pickFiveStar(reviews: TwoGisReview[]): ParsedReview[] {
  return reviews
    .filter((r) => r.rating === 5 && !r.is_hidden && !r.on_moderation)
    .map((r) => ({ r, text: (r.text ?? "").replace(/\s+\n/g, "\n").trim() }))
    .filter(({ text }) => text.length >= MIN_TEXT_LENGTH)
    .map(({ r, text }) => ({
      externalId: r.id,
      authorName: shortName(r.user?.name ?? ""),
      text,
      rating: r.rating,
      publishedAt: new Date(r.date_created),
    }));
}

/** Все отзывы филиала (постранично). */
export async function fetchTwoGisReviews(branchId: string, key = process.env.TWOGIS_REVIEWS_KEY || DEFAULT_KEY) {
  const all: TwoGisReview[] = [];
  let url: string | null =
    `${API}/branches/${branchId}/reviews?limit=50&is_advertiser=false&sort_by=date_created` +
    `&fields=meta.total_count&locale=ru_KG&key=${key}`;
  for (let page = 0; url && page < 20; page++) {
    const res: Response = await fetch(url, {
      headers: { origin: "https://2gis.kg", referer: "https://2gis.kg/" },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`2GIS ответил ${res.status}`);
    const data = (await res.json()) as { reviews?: TwoGisReview[]; meta?: { next_link?: string } };
    if (!Array.isArray(data.reviews)) throw new Error("2GIS: неожиданный формат ответа");
    all.push(...data.reviews);
    const next = data.meta?.next_link;
    url = next ? (next.includes("key=") ? next : `${next}&key=${key}`) : null;
  }
  return all;
}

/** id филиала из ссылки вида https://2gis.kg/bishkek/firm/70000001080121049 */
export function branchIdFromUrl(url: string): string | null {
  return url.match(/firm\/(\d+)/)?.[1] ?? null;
}
