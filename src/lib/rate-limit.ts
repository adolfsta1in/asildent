import "server-only";
import { headers } from "next/headers";
import { db } from "./db";

/**
 * Простой rate limit на таблице в БД — работает и на serverless (Vercel), где нет общей памяти.
 * Возвращает true, если действие разрешено (и засчитывает попытку).
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const since = new Date(Date.now() - windowMs);
  const count = await db.rateLimitHit.count({ where: { key, createdAt: { gte: since } } });
  if (count >= limit) return false;
  await db.rateLimitHit.create({ data: { key } });
  // Изредка чистим старые записи, чтобы таблица не росла.
  if (Math.random() < 0.02) {
    await db.rateLimitHit.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 3600_000) } } });
  }
  return true;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}
