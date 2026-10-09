import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { TAGS } from "../cache-tags";
import { db } from "../db";
import { nearestDoctorSlots } from "./service";

export type NearestSlot = { start: string; doctorSlug: string; doctorName: unknown } | null;

/**
 * Ближайшее свободное окно в клинике (для блока на главной); с doctorSlug — только у этого врача.
 * Кэшируется на несколько минут и сбрасывается при новой записи или изменении графика.
 */
export async function nearestClinicSlot(doctorSlug?: string): Promise<NearestSlot> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });
  cacheTag(TAGS.schedule);

  const doctors = await db.doctor.findMany({
    where: { isActive: true, ...(doctorSlug ? { slug: doctorSlug } : {}) },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      services: { where: { service: { isActive: true } }, select: { service: { select: { durationMin: true } } } },
    },
  });

  let best: NearestSlot = null;
  for (const d of doctors) {
    if (d.services.length === 0) continue;
    const duration = Math.min(...d.services.map((s) => s.service.durationMin));
    const [slot] = await nearestDoctorSlots(d.id, duration, 1);
    if (slot && (!best || slot.start.toISOString() < best.start)) {
      best = { start: slot.start.toISOString(), doctorSlug: d.slug, doctorName: d.name };
    }
  }
  return best;
}
