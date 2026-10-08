import { NextResponse, type NextRequest } from "next/server";
import { dateParam, resolveServiceAndDoctor } from "@/lib/booking/query";
import { findSlots } from "@/lib/slots/service";

/** GET /api/slots?service=<id>&doctor=<id|any>&date=YYYY-MM-DD — свободные слоты на дату. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const date = dateParam(params, "date");
  const resolved = await resolveServiceAndDoctor(params);
  if (!resolved || !date) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const slots = await findSlots({
    serviceId: resolved.service.id,
    durationMin: resolved.service.durationMin,
    doctorId: resolved.doctorId,
    from: date,
    to: date,
  });
  return NextResponse.json(
    { slots: slots.map((s) => ({ start: s.start.toISOString(), end: s.end.toISOString(), doctorIds: s.doctorIds })) },
    { headers: { "cache-control": "no-store" } },
  );
}
