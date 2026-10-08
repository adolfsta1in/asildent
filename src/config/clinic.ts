/**
 * Начальные настройки клиники.
 *
 * Эти значения seed-скрипт записывает в таблицу ClinicSettings. После этого
 * всё редактируется в админке: «Настройки». Если нужно перенастроить шаблон под
 * новую клинику до первого запуска, достаточно поменять значения здесь и
 * выполнить `npm run db:reset`.
 */
import type { ThemeId } from "./themes";

export type LocalizedText = { ru: string; ky: string };

/** Часы работы по дням недели: 0 — воскресенье … 6 — суббота. null — выходной. */
export type WorkingHours = Record<"0" | "1" | "2" | "3" | "4" | "5" | "6", { open: string; close: string } | null>;

export type ClinicConfig = {
  name: string;
  shortName: string;
  tagline: LocalizedText;
  description: LocalizedText;
  about: LocalizedText;
  logoUrl: string | null;
  phones: string[];
  whatsapp: string;
  telegram: string;
  instagram: string;
  email: string;
  address: LocalizedText;
  addressNote: LocalizedText;
  lat: number;
  lng: number;
  twoGisUrl: string;
  /** Ссылка (src) iframe-виджета карты из конструктора 2GIS. Пусто — показывается стилизованная карта с кнопкой маршрута. */
  mapEmbedUrl: string;
  workingHours: WorkingHours;
  theme: ThemeId;
  foundedYear: number;
  patientsCount: number;
  rating: number;
  /** Минимум минут от текущего момента до записи. */
  bookingLeadMinutes: number;
  /** На сколько дней вперёд открыта запись. */
  bookingHorizonDays: number;
  /** Шаг сетки слотов в минутах. */
  slotStepMinutes: number;
  /** Юридическое лицо и ИНН для политики конфиденциальности. */
  legalName: string;
  legalInn: string;
};

export const clinicDefaults: ClinicConfig = {
  name: "AsilDent",
  shortName: "AsilDent",
  tagline: {
    ru: "Стоматология для всей семьи",
    ky: "Бүт үй-бүлө үчүн стоматология",
  },
  description: {
    ru: "Лечение зубов, имплантация, виниры и брекеты на проспекте Токомбаева в Бишкеке. Онлайн-запись к врачу за минуту.",
    ky: "Бишкекте, Токомбаев проспектинде тиш дарылоо, имплантация, винирлер жана брекеттер. Дарыгерге бир мүнөттө онлайн жазылыңыз.",
  },
  about: {
    ru: "AsilDent открылась осенью 2023 года на проспекте Аалы Токомбаева. Лечим зубы взрослым и детям, ставим импланты и брекеты, делаем коронки и виниры. Сначала осмотр и понятный план с ценами — прайс у нас открытый, — потом лечение. В отзывах пациенты чаще всего пишут одно и то же: всё объясняют, работают аккуратно и без боли.",
    ky: "AsilDent 2023-жылдын күзүндө Аалы Токомбаев проспектинде ачылган. Чоңдордун жана балдардын тиштерин дарылайбыз, имплант жана брекет коебуз, коронка жана винир жасайбыз. Адегенде кароо жана баасы көрсөтүлгөн так план — баа тизмебиз ачык, — андан кийин дарылоо. Бейтаптар пикирлеринде көбүнчө бир нерсени белгилешет: баарын түшүндүрүшөт, этият жана оорутпай иштешет.",
  },
  logoUrl: "/brand/logo.png",
  phones: ["+996 700 455 677", "+996 702 455 677"],
  whatsapp: "996702455677",
  telegram: "",
  instagram: "asildent.kgz",
  email: "",
  address: {
    ru: "г. Бишкек, пр. Аалы Токомбаева, 7/5",
    ky: "Бишкек ш., Аалы Токомбаев пр., 7/5",
  },
  addressNote: {
    ru: "Цокольный этаж, над входом синяя вывеска AsilDent. Приём по предварительной записи.",
    ky: "Цоколдук кабат, кире беришинде көк түстөгү AsilDent жазуусу бар. Алдын ала жазылуу менен кабыл алабыз.",
  },
  lat: 42.813101,
  lng: 74.626834,
  twoGisUrl: "https://2gis.kg/bishkek/firm/70000001080121049",
  mapEmbedUrl: "",
  workingHours: {
    "0": null,
    "1": { open: "10:00", close: "20:00" },
    "2": { open: "10:00", close: "20:00" },
    "3": { open: "10:00", close: "20:00" },
    "4": { open: "10:00", close: "20:00" },
    "5": { open: "10:00", close: "20:00" },
    "6": { open: "10:00", close: "20:00" },
  },
  theme: "asil",
  foundedYear: 2023,
  // Число пациентов неизвестно: 0 — плашка на сайте не показывается.
  patientsCount: 0,
  rating: 4.9,
  bookingLeadMinutes: 120,
  bookingHorizonDays: 30,
  slotStepMinutes: 15,
  // Юрлицо и ИНН нужно уточнить у клиники.
  legalName: "Стоматологическая клиника «AsilDent»",
  legalInn: "",
};
