"use server";

import { revalidatePath, updateTag } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { isStatus, OCCUPYING } from "@/lib/appointment-status";
import { requireAdmin } from "@/lib/auth/session";
import { createAppointment, type BookingResult } from "@/lib/booking/create";
import { rescheduleAppointment } from "@/lib/booking/reschedule";
import { TAGS } from "@/lib/cache-tags";
import { db } from "@/lib/db";
import { cellStarts } from "@/lib/slots/cells";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Смена статуса. Отмена/«не пришёл» освобождают время врача, возврат в активный статус снова его занимает. */
export async function setAppointmentStatus(id: string, status: string): Promise<ActionResult> {
  await requireAdmin();
  if (!isStatus(status)) return { ok: false, error: "Неизвестный статус" };

  const appointment = await db.appointment.findUnique({ where: { id } });
  if (!appointment) return { ok: false, error: "Запись не найдена" };

  const wasOccupying = (OCCUPYING as string[]).includes(appointment.status);
  const willOccupy = OCCUPYING.includes(status);

  try {
    await db.$transaction(async (tx) => {
      await tx.appointment.update({ where: { id }, data: { status } });
      if (wasOccupying && !willOccupy) {
        await tx.bookedSlot.deleteMany({ where: { appointmentId: id } });
      }
      if (!wasOccupying && willOccupy) {
        await tx.bookedSlot.createMany({
          data: cellStarts(appointment.startAt, appointment.endAt).map((slotStart) => ({
            appointmentId: id,
            doctorId: appointment.doctorId,
            slotStart,
          })),
        });
      }
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "Это время у врача уже занято другой записью" };
    }
    throw e;
  }

  updateTag(TAGS.schedule);
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function deleteAppointment(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.appointment.delete({ where: { id } });
  updateTag(TAGS.schedule);
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/** Запись из админки (например, пациент позвонил). Те же проверки слотов, без антиспама и отступа. */
export async function adminCreateAppointment(input: {
  serviceId: string;
  doctorId: string;
  start: string;
  name: string;
  phone: string;
  comment?: string;
  status: "NEW" | "CONFIRMED";
}): Promise<BookingResult> {
  await requireAdmin();
  const result = await createAppointment(
    { ...input, consent: true, locale: "ru", website: "", startedAt: 1 },
    { source: "admin", trusted: true, status: input.status },
  );
  if (result.ok) revalidatePath("/admin", "layout");
  return result;
}

const RESCHEDULE_ERRORS: Record<string, string> = {
  NOT_FOUND: "Запись не найдена",
  NOT_ACTIVE: "Переносить можно только новые и подтверждённые записи",
  DOCTOR: "Этот врач не оказывает эту услугу",
  SLOT_TAKEN: "Это время уже занято — выберите другое",
  UNKNOWN: "Не удалось перенести запись",
};

/** Перенос записи на другое время или к другому врачу. */
export async function rescheduleAppointmentAction(id: string, input: { start: string; doctorId: string }): Promise<ActionResult> {
  await requireAdmin();
  const result = await rescheduleAppointment(id, input);
  if (!result.ok) return { ok: false, error: RESCHEDULE_ERRORS[result.error] };
  updateTag(TAGS.schedule);
  revalidatePath("/admin", "layout");
  return { ok: true };
}
