import "server-only";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL не задан");
  // Адаптер выбирается по строке подключения: file:… — SQLite, postgres://… — PostgreSQL.
  const adapter = url.startsWith("postgres")
    ? // Serverless: каждая функция держит свой пул, поэтому он маленький (иначе упрёмся в лимит соединений пулера).
      new PrismaPg({ connectionString: url, max: Number(process.env.DB_POOL_MAX ?? 3) })
    : new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
