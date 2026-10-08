import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { nearestDoctorSlots } from "@/lib/slots/service";

/** GET /api/doctors/<slug>/nearest — ближайшие свободные окна врача (по самой короткой из его услуг). */
export async function GET(_: NextRequest, ctx: RouteContext<"/api/doctors/[slug]/nearest">) {
  const { slug } = await ctx.params;
  const doctor = await db.doctor.findFirst({
    where: { slug, isActive: true },
    select: { id: true, services: { where: { service: { isActive: true } }, select: { service: { select: { durationMin: true } } } } },
  });
  if (!doctor) return NextResponse.json({ slots: [] }, { status: 404 });
  const duration = doctor.services.length ? Math.min(...doctor.services.map((s) => s.service.durationMin)) : 30;
  const slots = await nearestDoctorSlots(doctor.id, duration, 40);
  return NextResponse.json(
    { slots: slots.map((s) => s.start.toISOString()) },
    { headers: { "cache-control": "no-store" } },
  );
}
