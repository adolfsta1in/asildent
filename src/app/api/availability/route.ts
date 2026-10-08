import { NextResponse, type NextRequest } from "next/server";
import { dateParam, resolveServiceAndDoctor } from "@/lib/booking/query";
import { availableDates } from "@/lib/slots/engine";
import { findSlots } from "@/lib/slots/service";

/** GET /api/availability?service=<id>&doctor=<id|any> — даты, на которые есть свободное время. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const resolved = await resolveServiceAndDoctor(params);
  if (!resolved) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const slots = await findSlots({
    serviceId: resolved.service.id,
    durationMin: resolved.service.durationMin,
    doctorId: resolved.doctorId,
    from: dateParam(params, "from"),
    to: dateParam(params, "to"),
  });
  return NextResponse.json(
    { dates: availableDates(slots) },
    { headers: { "cache-control": "no-store" } },
  );
}
