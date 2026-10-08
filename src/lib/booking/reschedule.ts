import "server-only";
import { revalidateTag } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { TAGS } from "../cache-tags";
import { db } from "../db";
import { cellStarts } from "../slots/cells";
import { isSlotAvailable } from "../slots/engine";
import { doctorsForService, getBookingSettings, loadAvailability } from "../slots/service";
import { toDateKey } from "../time";

export type RescheduleResult =
  | { ok: true }
  | { ok: false; error: "NOT_FOUND" | "NOT_ACTIVE" | "DOCTOR" | "SLOT_TAKEN" | "UNKNOWN" };

class SlotUnavailableError extends Error {}

/**
 * Перенос записи на другое время (и, при желании, к другому врачу той же услуги).
 * Те же гарантии, что при создании: в транзакции освобождаем старые ячейки, заново проверяем слот
 * по графику и чужим записям и занимаем новые ячейки — уникальный (doctorId, slotStart) не даст
 * наложиться на запись, созданную параллельно.
 */
export async function rescheduleAppointment(id: string, input: { start: string; doctorId: string }): Promise<RescheduleResult> {
  const appointment = await db.appointment.findUnique({ where: { id }, include: { service: true } });
  if (!appointment) return { ok: false, error: "NOT_FOUND" };
  if (appointment.status !== "NEW" && appointment.status !== "CONFIRMED") return { ok: false, error: "NOT_ACTIVE" };

  const doctors = await doctorsForService(appointment.serviceId);
  if (!doctors.includes(input.doctorId)) return { ok: false, error: "DOCTOR" };

  const start = new Date(input.start);
  if (Number.isNaN(start.getTime())) return { ok: false, error: "UNKNOWN" };
  const end = new Date(start.getTime() + appointment.service.durationMin * 60_000);
  const date = toDateKey(start);
  const settings = await getBookingSettings();

  try {
    await db.$transaction(async (tx) => {
      await tx.bookedSlot.deleteMany({ where: { appointmentId: id } });
      const [availability] = await loadAvailability([input.doctorId], date, date, tx, id);
      const free = isSlotAvailable(availability, start, {
        durationMin: appointment.service.durationMin,
        stepMin: settings.stepMin,
        leadMin: 0,
        horizonDays: Math.max(settings.horizonDays, 90),
        now: new Date(),
      });
      if (!free) throw new SlotUnavailableError();

      await tx.appointment.update({
        where: { id },
        data: {
          doctorId: input.doctorId,
          startAt: start,
          endAt: end,
          bookedSlots: { create: cellStarts(start, end).map((slotStart) => ({ doctorId: input.doctorId, slotStart })) },
        },
      });
    });
  } catch (e) {
    if (e instanceof SlotUnavailableError) return { ok: false, error: "SLOT_TAKEN" };
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return { ok: false, error: "SLOT_TAKEN" };
    console.error("[booking] ошибка переноса записи", e);
    return { ok: false, error: "UNKNOWN" };
  }

  revalidateTag(TAGS.schedule, "max");
  return { ok: true };
}
