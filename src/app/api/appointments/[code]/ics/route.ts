import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { buildIcs } from "@/lib/ics";
import { tr } from "@/lib/localized";
import { getClinic } from "@/lib/settings";
import { siteUrl } from "@/lib/site";

/** GET /api/appointments/<код>/ics — файл для «Добавить в календарь». Без персональных данных пациента. */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/appointments/[code]/ics">) {
  const { code } = await ctx.params;
  if (!/^[A-Z0-9]{4,12}$/.test(code)) return new NextResponse("Not found", { status: 404 });

  const appointment = await db.appointment.findUnique({
    where: { publicCode: code },
    include: { service: true, doctor: true },
  });
  if (!appointment || appointment.status === "CANCELLED") return new NextResponse("Not found", { status: 404 });

  const locale = request.nextUrl.searchParams.get("lang") === "ky" ? "ky" : "ru";
  const clinic = await getClinic();
  const service = tr(appointment.service.name, locale);
  const doctor = tr(appointment.doctor.name, locale);
  const address = tr(clinic.address, locale);

  const ics = buildIcs({
    uid: `${appointment.publicCode}@${new URL(siteUrl()).hostname}`,
    start: appointment.startAt,
    end: appointment.endAt,
    title: `${service} — ${clinic.name}`,
    description: [
      `${locale === "ky" ? "Дарыгер" : "Врач"}: ${doctor}`,
      `${locale === "ky" ? "Жазылуу номери" : "Номер записи"}: ${appointment.publicCode}`,
      `Телефон: ${clinic.phones[0] ?? ""}`,
    ].join("\n"),
    location: `${clinic.name}, ${address}`,
    organizer: clinic.name,
    url: siteUrl(),
  });

  return new NextResponse(ics, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="zapis-${appointment.publicCode}.ics"`,
      "cache-control": "no-store",
    },
  });
}
