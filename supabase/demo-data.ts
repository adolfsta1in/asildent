// Генератор SQL демо-данных AsilDent для Supabase: npx tsx supabase/demo-data.ts → supabase/out/*.sql
import { mkdirSync, writeFileSync } from "node:fs";
import { clinicDefaults } from "../src/config/clinic";
import { categories, doctors, faqs, reviews, services } from "../prisma/seed-data";
import { addDays, hhmmToMinutes, toDateKey, weekdayOf, zonedToUtc } from "../src/lib/time";

const OUT = new URL("./out", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

// Детерминированный ГПСЧ — одинаковый результат при повторном запуске.
let seed = 20261008;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = <T,>(a: readonly T[]) => a[Math.floor(rnd() * a.length)];
const weighted = <T,>(items: [T, number][]) => {
  let r = rnd() * items.reduce((s, [, w]) => s + w, 0);
  for (const [v, w] of items) if ((r -= w) < 0) return v;
  return items[0][0];
};
const id = (p: string) => p + Array.from({ length: 20 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(rnd() * 36)]).join("");
const q = (v: unknown): string =>
  v === null || v === undefined ? "NULL" : typeof v === "number" || typeof v === "boolean" ? String(v) : `'${String(v).replace(/'/g, "''")}'`;
const j = (v: unknown) => `${q(JSON.stringify(v))}::jsonb`;
const ts = (d: Date) => `'${d.toISOString().replace("T", " ").replace("Z", "")}'`;
const now = new Date();

const s: string[] = [];
const c = clinicDefaults;
s.push(`INSERT INTO "ClinicSettings" ("id","name","shortName","tagline","description","about","logoUrl","phones","whatsapp","telegram","instagram","email","address","addressNote","lat","lng","twoGisUrl","mapEmbedUrl","workingHours","theme","foundedYear","patientsCount","rating","bookingLeadMinutes","bookingHorizonDays","slotStepMinutes","legalName","legalInn","updatedAt") VALUES (1,${q(c.name)},${q(c.shortName)},${j(c.tagline)},${j(c.description)},${j(c.about)},${q(c.logoUrl)},${j(c.phones)},${q(c.whatsapp)},${q(c.telegram)},${q(c.instagram)},${q(c.email)},${j(c.address)},${j(c.addressNote)},${c.lat},${c.lng},${q(c.twoGisUrl)},${q(c.mapEmbedUrl)},${j(c.workingHours)},${q(c.theme)},${c.foundedYear},${c.patientsCount},${c.rating},${c.bookingLeadMinutes},${c.bookingHorizonDays},${c.slotStepMinutes},${q(c.legalName)},${q(c.legalInn)},${ts(now)});`);

const catIds = new Map<string, string>();
categories.forEach((cat, i) => {
  const cid = id("cat_");
  catIds.set(cat.slug, cid);
  s.push(`INSERT INTO "ServiceCategory" ("id","slug","name","sortOrder") VALUES (${q(cid)},${q(cat.slug)},${j(cat.name)},${i});`);
});
const svc = new Map<string, { id: string; dur: number; price: number; name: string }>();
services.forEach((sv, i) => {
  const sid = id("svc_");
  svc.set(sv.slug, { id: sid, dur: sv.durationMin, price: sv.priceFrom, name: sv.name.ru });
  s.push(`INSERT INTO "Service" ("id","slug","categoryId","name","shortDescription","description","durationMin","priceFrom","priceTo","isPopular","sortOrder","updatedAt") VALUES (${q(sid)},${q(sv.slug)},${q(catIds.get(sv.category))},${j(sv.name)},${j(sv.short)},${j(sv.description)},${sv.durationMin},${sv.priceFrom},${q(sv.priceTo ?? null)},${sv.popular ?? false},${i},${ts(now)});`);
});
const docIds = new Map<string, string>();
doctors.forEach((d, i) => {
  const did = id("doc_");
  docIds.set(d.slug, did);
  s.push(`INSERT INTO "Doctor" ("id","slug","name","specialty","bio","education","experienceSince","photoUrl","sortOrder","updatedAt") VALUES (${q(did)},${q(d.slug)},${j(d.name)},${j(d.specialty)},${j(d.bio)},${j(d.education)},${d.experienceSince},${q(d.photoUrl ?? null)},${i},${ts(now)});`);
  for (const sl of d.services) s.push(`INSERT INTO "DoctorService" ("doctorId","serviceId") VALUES (${q(did)},${q(svc.get(sl)!.id)});`);
  for (const [wd, h] of Object.entries(d.schedule)) {
    const [a, b, bs, be] = h!;
    s.push(`INSERT INTO "ScheduleRule" ("id","doctorId","weekday","startMin","endMin","breakStartMin","breakEndMin") VALUES (${q(id("sr_"))},${q(did)},${wd},${hhmmToMinutes(a)},${hhmmToMinutes(b)},${q(bs ? hhmmToMinutes(bs) : null)},${q(be ? hhmmToMinutes(be) : null)});`);
  }
});
reviews.forEach((r, i) =>
  s.push(`INSERT INTO "Review" ("id","authorName","text","rating","serviceName","isDemo","sortOrder") VALUES (${q(id("rev_"))},${q(r.author)},${j(r.text)},${r.rating},${j(r.service)},${r.isDemo ?? true},${i});`),
);
faqs.forEach((f, i) => s.push(`INSERT INTO "Faq" ("id","question","answer","sortOrder") VALUES (${q(id("faq_"))},${j(f.q)},${j(f.a)},${i});`));

// ---- Демо-записи ----
const today = toDateKey(now);
const exceptions: Record<string, Record<string, [number, number] | "off">> = {};
const exc: string[] = [];
const addExc = (slug: string, date: string, type: "DAY_OFF" | "CUSTOM_HOURS", note: string, hours?: [string, string]) => {
  (exceptions[slug] ??= {})[date] = hours ? [hhmmToMinutes(hours[0]), hhmmToMinutes(hours[1])] : "off";
  exc.push(`INSERT INTO "ScheduleException" ("id","doctorId","date","type","startMin","endMin","note") VALUES (${q(id("ex_"))},${q(docIds.get(slug))},${q(date)},${q(type)},${q(hours ? hhmmToMinutes(hours[0]) : null)},${q(hours ? hhmmToMinutes(hours[1]) : null)},${q(note)});`);
};
const nextWorkday = (from: number) => {
  let d = addDays(today, from);
  while (weekdayOf(d) === 0) d = addDays(d, 1);
  return d;
};
addExc("zhanybekov-syymyk", nextWorkday(6), "DAY_OFF", "Ортодонтический конгресс");
addExc("hurshidov-asif", nextWorkday(3), "CUSTOM_HOURS", "Утром — операция в другой клинике", ["14:00", "20:00"]);
addExc("bekzhan", nextWorkday(-5), "DAY_OFF", "Больничный");

const first = ["Айгерим", "Нурлан", "Бектур", "Жибек", "Мээрим", "Азамат", "Элиза", "Тимур", "Айжан", "Улан", "Динара", "Эрлан", "Камила", "Арстан", "Нургуль", "Санжар", "Алина", "Данияр", "Асель", "Бакыт", "Гульнара", "Максат", "Айпери", "Руслан", "Сезим", "Таалай", "Мадина", "Адилет", "Чолпон", "Ислам", "Анна", "Игорь", "Ольга", "Дмитрий", "Наргиза", "Эльдар"];
const last = ["Асанов", "Токтогулов", "Абдыкадыров", "Жумабеков", "Сыдыков", "Исаков", "Мамытов", "Турдубаев", "Бейшеев", "Иманалиев", "Осмонов", "Кадыров", "Эсенов", "Ким", "Петров", "Орозбеков", "Алиев", "Байтемиров"];
const female = new Set(["Айгерим", "Жибек", "Мээрим", "Элиза", "Айжан", "Динара", "Камила", "Нургуль", "Алина", "Асель", "Гульнара", "Айпери", "Сезим", "Мадина", "Чолпон", "Анна", "Ольга", "Наргиза"]);
const fem = (l: string) => (l === "Ким" ? l : l.endsWith("ов") || l.endsWith("ев") ? l + "а" : l);
const patients = Array.from({ length: 90 }, () => {
  const f = pick(first);
  const l = pick(last);
  const prefix = pick(["555", "700", "702", "707", "770", "772", "777", "550", "500", "999"]);
  return { name: `${f} ${female.has(f) ? fem(l) : l}`, phone: `+996${prefix}${String(Math.floor(rnd() * 1e6)).padStart(6, "0")}` };
});

const comments: Record<string, string[]> = {
  web: ["Болит зуб", "Чувствительные зубы", "Нужен снимок", "Боюсь стоматологов, пожалуйста, аккуратно", "Удобнее после работы", "Первый визит в клинику"],
  whatsapp: ["WhatsApp: просят вечернее время", "WhatsApp: уточнили цену перед записью", "WhatsApp: придут вдвоём с мамой", "WhatsApp: просят напомнить за день"],
  phone: ["Звонок пациента: болит зуб", "Записали по звонку родственника", "Звонок: повторный визит"],
  instagram: ["Пришли из Instagram", "Директ Instagram: вопрос про цены", "Instagram: после поста клиники"],
  admin: ["Записан на ресепшене после консультации", "Перенос с прошлой недели"],
};

type Busy = [number, number][];
const busy = new Map<string, Busy>();
const appts: string[] = [];
let n = 0;
for (let off = -21; off <= 14; off++) {
  const date = addDays(today, off);
  const wd = weekdayOf(date);
  for (const d of doctors) {
    const rule = d.schedule[wd];
    if (!rule) continue;
    const ex = exceptions[d.slug]?.[date];
    if (ex === "off") continue;
    let [open, close] = [hhmmToMinutes(rule[0]), hhmmToMinutes(rule[1])];
    if (ex) [open, close] = ex;
    // Загрузка: прошлые дни плотнее, дальние будущие — реже (запись ещё набирается).
    const fill = off < 0 ? 0.42 : off === 0 ? 0.42 : Math.max(0.1, 0.38 - off * 0.022);
    const key = `${d.slug}|${date}`;
    const day: Busy = busy.get(key) ?? [];
    busy.set(key, day);
    const attempts = Math.round(((close - open) / 60) * fill * 1.3);
    for (let a = 0; a < attempts; a++) {
      const sl = pick(d.services);
      const sv = svc.get(sl)!;
      const start = open + Math.floor(rnd() * ((close - open - sv.dur) / 15 + 1)) * 15;
      const end = start + sv.dur;
      if (end > close || day.some(([x, y]) => start < y && x < end)) continue;
      const startAt = zonedToUtc(date, start);
      const endAt = new Date(startAt.getTime() + sv.dur * 60_000);
      const isPast = endAt < now;
      const status = isPast
        ? weighted([["COMPLETED", 80], ["NO_SHOW", 7], ["CANCELLED", 13]])
        : off === 0
          ? weighted([["CONFIRMED", 80], ["NEW", 12], ["CANCELLED", 8]])
          : weighted([["CONFIRMED", off <= 3 ? 60 : 35], ["NEW", off <= 3 ? 30 : 55], ["CANCELLED", 10]]);
      if (status !== "CANCELLED" && status !== "NO_SHOW") day.push([start, end]);
      const source = weighted([["web", 42], ["whatsapp", 26], ["phone", 14], ["instagram", 12], ["admin", 6]]);
      // Повторные пациенты: каждый третий — из «постоянных» первых 25.
      const p = rnd() < 0.33 ? patients[Math.floor(rnd() * 25)] : pick(patients);
      const leadH = weighted([[2 + rnd() * 20, 30], [24 + rnd() * 72, 45], [96 + rnd() * 240, 25]]);
      let createdAt = new Date(startAt.getTime() - leadH * 3600_000);
      const ch = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Bishkek" }).format(createdAt));
      if (source !== "web" && (ch < 9 || ch > 20)) createdAt = new Date(createdAt.getTime() + (ch < 9 ? 9 - ch : 24 - ch + 9) * 3600_000);
      if (createdAt > now) createdAt = new Date(now.getTime() - rnd() * 6 * 3600_000);
      if (createdAt > startAt) createdAt = new Date(startAt.getTime() - 3 * 3600_000);
      const updatedAt = isPast ? new Date(endAt.getTime() + 20 * 60_000) : status === "NEW" ? createdAt : new Date(createdAt.getTime() + (0.2 + rnd()) * 3600_000);
      const comment = sl === "udalenie-molochnogo-zuba" && rnd() < 0.6 ? `Ребёнок, ${5 + Math.floor(rnd() * 6)} лет` : rnd() < 0.35 ? pick(comments[source]) : null;
      const code = Array.from({ length: 8 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(rnd() * 32)]).join("");
      const web = source === "web";
      appts.push(
        `(${q(code)},${q(sl)},${q(d.slug)},${ts(startAt)},${q(p.name)},${q(p.phone)},${q(comment)},${q(({ COMPLETED: "D", NO_SHOW: "S", NEW: "N", CANCELLED: "X", CONFIRMED: "K" } as Record<string, string>)[status])},${q(source)},${q(web && rnd() < 0.2 ? "ky" : "ru")},${ts(createdAt)},${ts(updatedAt)})`,
      );
      n++;
    }
  }
}

const head = `INSERT INTO "Appointment" ("id","publicCode","serviceId","doctorId","startAt","endAt","patientName","patientPhone","comment","status","source","locale","consentAt","createdAt","updatedAt")
SELECT 'apt_' || substr(md5(v.code), 1, 20), v.code, s."id", d."id", v.st::timestamp, v.st::timestamp + make_interval(mins => s."durationMin"),
  v.pn, v.ph, v.cm, CASE v.stt WHEN 'D' THEN 'COMPLETED' WHEN 'S' THEN 'NO_SHOW' WHEN 'N' THEN 'NEW' WHEN 'X' THEN 'CANCELLED' ELSE 'CONFIRMED' END,
  v.src, v.loc, CASE WHEN v.src = 'web' THEN v.cr::timestamp END, v.cr::timestamp, v.up::timestamp
FROM (VALUES\n`;
const tail = `\n) AS v(code, svc, doc, st, pn, ph, cm, stt, src, loc, cr, up)
JOIN "Service" s ON s."slug" = v.svc JOIN "Doctor" d ON d."slug" = v.doc;`;
const parts: string[] = [];
for (let i = 0; i < appts.length; i += 110) parts.push(head + appts.slice(i, i + 110).join(",\n") + tail);
const apptSql = [exc.join("\n"), ...parts];
writeFileSync(`${OUT}/static.sql`, s.join("\n"));
apptSql.forEach((p, i) => writeFileSync(`${OUT}/appts_${i}.sql`, p));
console.log("appointments:", n, "static:", s.join("\n").length, "parts:", apptSql.map((p) => p.length));
