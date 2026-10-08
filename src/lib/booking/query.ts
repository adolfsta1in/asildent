import "server-only";
import { z } from "zod";
import { db } from "../db";
import { isDateKey } from "../time";

const querySchema = z.object({
  service: z.string().min(1),
  doctor: z.string().min(1).default("any"),
});

/** Разбор параметров service/doctor из запроса к API слотов. */
export async function resolveServiceAndDoctor(params: URLSearchParams) {
  const parsed = querySchema.safeParse({
    service: params.get("service") ?? undefined,
    doctor: params.get("doctor") ?? undefined,
  });
  if (!parsed.success) return null;
  const service = await db.service.findFirst({
    where: { id: parsed.data.service, isActive: true },
    select: { id: true, durationMin: true },
  });
  if (!service) return null;
  return { service, doctorId: parsed.data.doctor === "any" ? null : parsed.data.doctor };
}

export function dateParam(params: URLSearchParams, name: string) {
  const v = params.get(name);
  return v && isDateKey(v) ? v : undefined;
}
