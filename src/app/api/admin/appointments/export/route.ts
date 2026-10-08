import { NextResponse, type NextRequest } from "next/server";
import { STATUS_META, isStatus } from "@/lib/appointment-status";
import { listAppointments, parseFilters } from "@/lib/admin/appointments";
import { isAdmin } from "@/lib/auth/session";
import { tr } from "@/lib/localized";
import { formatDateShort, formatTime } from "@/lib/time";
import { formatKgPhone } from "@/lib/validators/phone";

function csvCell(v: string | number | null | undefined) {
  const s = String(v ?? "");
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** CSV для Excel: UTF-8 с BOM и разделителем «;» (так его корректно открывает русская локаль Excel). */
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) return new NextResponse("Unauthorized", { status: 401 });
  const filters = parseFilters(Object.fromEntries(request.nextUrl.searchParams));
  const rows = await listAppointments(filters, 10_000);

  const header = ["Номер", "Дата", "Время", "Окончание", "Пациент", "Телефон", "Услуга", "Врач", "Статус", "Источник", "Комментарий", "Создана"];
  const lines = rows.map((a) =>
    [
      a.publicCode,
      formatDateShort(a.startAt),
      formatTime(a.startAt),
      formatTime(a.endAt),
      a.patientName,
      formatKgPhone(a.patientPhone),
      tr(a.service.name, "ru"),
      tr(a.doctor.name, "ru"),
      isStatus(a.status) ? STATUS_META[a.status].label : a.status,
      a.source === "admin" ? "Админка" : "Сайт",
      a.comment,
      `${formatDateShort(a.createdAt)} ${formatTime(a.createdAt)}`,
    ]
      .map(csvCell)
      .join(";"),
  );
  const csv = "﻿" + [header.join(";"), ...lines].join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="zapisi-${stamp}.csv"`,
      "cache-control": "no-store",
    },
  });
}
