import { NextResponse } from "next/server";
import { nearestClinicSlot } from "@/lib/slots/nearest";

/** GET /api/next-slot — ближайшее свободное окно в клинике (для карточки на главной). */
export async function GET() {
  const slot = await nearestClinicSlot();
  return NextResponse.json({ slot }, { headers: { "cache-control": "public, max-age=60, stale-while-revalidate=300" } });
}
