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
  name: "Арча Дент",
  shortName: "Арча Дент",
  tagline: {
    ru: "Стоматология, к которой хочется возвращаться",
    ky: "Кайра келгиңиз келе турган стоматология",
  },
  description: {
    ru: "Лечение, имплантация, брекеты и профессиональная гигиена в центре Бишкека. Онлайн-запись к врачу за минуту.",
    ky: "Бишкектин борборунда тиш дарылоо, имплантация, брекеттер жана кесипкөй гигиена. Дарыгерге бир мүнөттө онлайн жазылыңыз.",
  },
  about: {
    ru: "Мы открылись в 2014 году как небольшой кабинет на два кресла. Сегодня у нас шесть врачей, собственный рентген-кабинет и стерилизационная по европейским протоколам. Мы не навязываем лишнего лечения: сначала диагностика и понятный план с ценами, потом решение — за вами.",
    ky: "Биз 2014-жылы эки креслолуу чакан кабинет катары ачылганбыз. Бүгүн бизде алты дарыгер, өзүбүздүн рентген кабинети жана европалык протоколдор боюнча стерилизация бөлмөсү бар. Ашыкча дарылоону таңуулабайбыз: адегенде диагностика жана баасы көрсөтүлгөн так план, андан кийин чечим сизде.",
  },
  logoUrl: null,
  phones: ["+996 555 000 000", "+996 312 000 000"],
  whatsapp: "996555000000",
  telegram: "archadent_demo",
  instagram: "archadent.demo",
  email: "hello@archadent.kg",
  address: {
    ru: "г. Бишкек, ул. Токтогула, 125",
    ky: "Бишкек ш., Токтогул көч., 125",
  },
  addressNote: {
    ru: "Вход со двора, 1 этаж. Есть парковка для пациентов.",
    ky: "Кире бериш короо тараптан, 1-кабат. Бейтаптар үчүн унаа токтотуучу жай бар.",
  },
  lat: 42.8746,
  lng: 74.6044,
  twoGisUrl: "https://2gis.kg/bishkek/geo/74.6044%2C42.8746",
  mapEmbedUrl: "",
  workingHours: {
    "0": null,
    "1": { open: "09:00", close: "20:00" },
    "2": { open: "09:00", close: "20:00" },
    "3": { open: "09:00", close: "20:00" },
    "4": { open: "09:00", close: "20:00" },
    "5": { open: "09:00", close: "20:00" },
    "6": { open: "10:00", close: "17:00" },
  },
  theme: "mint",
  foundedYear: 2014,
  patientsCount: 12000,
  rating: 4.9,
  bookingLeadMinutes: 120,
  bookingHorizonDays: 30,
  slotStepMinutes: 15,
  legalName: "ОсОО «Арча Дент»",
  legalInn: "00000000000000",
};
