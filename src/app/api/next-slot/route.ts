import { NextResponse } from "next/server";
import { nearestClinicSlot } from "@/lib/slots/nearest";

/** GET /api/next-slot[?doctor=slug] — ближайшее свободное окно в клинике или у врача (карточка на главной). */
export async function GET(request: Request) {
  const doctor = new URL(request.url).searchParams.get("doctor");
  const slot = await nearestClinicSlot(doctor && /^[a-z0-9-]{1,64}$/.test(doctor) ? doctor : undefined);
  return NextResponse.json({ slot }, { headers: { "cache-control": "public, max-age=60, stale-while-revalidate=300" } });
}
