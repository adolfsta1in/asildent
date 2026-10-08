import { cacheLife, cacheTag } from "next/cache";
import { clinicDefaults, type ClinicConfig, type WorkingHours } from "@/config/clinic";
import { isThemeId } from "@/config/themes";
import { TAGS } from "./cache-tags";
import { db } from "./db";
import { asLocalized } from "./localized";

export type ClinicSettings = ClinicConfig;

/** Настройки клиники из БД (с запасным вариантом из config/clinic.ts). Кэшируются до изменения в админке. */
export async function getClinic(): Promise<ClinicSettings> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.settings);

  const row = await db.clinicSettings.findUnique({ where: { id: 1 } });
  if (!row) return clinicDefaults;

  return {
    name: row.name,
    shortName: row.shortName,
    tagline: asLocalized(row.tagline),
    description: asLocalized(row.description),
    about: asLocalized(row.about),
    logoUrl: row.logoUrl,
    phones: Array.isArray(row.phones) ? (row.phones as string[]) : [],
    whatsapp: row.whatsapp,
    telegram: row.telegram,
    instagram: row.instagram,
    email: row.email,
    address: asLocalized(row.address),
    addressNote: asLocalized(row.addressNote),
    lat: row.lat,
    lng: row.lng,
    twoGisUrl: row.twoGisUrl,
    mapEmbedUrl: row.mapEmbedUrl,
    workingHours: (row.workingHours ?? clinicDefaults.workingHours) as WorkingHours,
    theme: isThemeId(row.theme) ? row.theme : "mint",
    foundedYear: row.foundedYear,
    patientsCount: row.patientsCount,
    rating: row.rating,
    bookingLeadMinutes: row.bookingLeadMinutes,
    bookingHorizonDays: row.bookingHorizonDays,
    slotStepMinutes: row.slotStepMinutes,
    legalName: row.legalName,
    legalInn: row.legalInn,
  };
}
