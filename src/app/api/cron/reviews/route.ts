import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { TAGS } from "@/lib/cache-tags";
import { syncTwoGisReviews } from "@/lib/reviews/sync";

/**
 * GET /api/cron/reviews — подтянуть новые отзывы из 2GIS. Вызывается Vercel Cron раз в сутки (vercel.json);
 * Vercel сам передаёт заголовок Authorization: Bearer <CRON_SECRET>.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await syncTwoGisReviews();
    revalidateTag(TAGS.content, "max");
    return NextResponse.json(result);
  } catch (e) {
    console.error("[cron/reviews]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "sync failed" }, { status: 502 });
  }
}
