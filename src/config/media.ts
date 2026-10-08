/**
 * Фото клиники в public/. Источник — Instagram @asildent.kgz и профили врачей (см. docs/clinic-data.md).
 * Пусто (null / []) — показываются иллюстрации шаблона.
 */
import type { LocalizedText } from "./clinic";

export const media: {
  /** Фото справа на первом экране главной. */
  hero: { src: string; alt: LocalizedText } | null;
  /** Фото для блока «До и после» — по порядку подписей home.beforeAfter.cases. */
  beforeAfter: { before: string; after: string }[];
  /** Галерея «Наши работы» на странице «О клинике». Пусто — секция скрыта. */
  works: { src: string; caption: LocalizedText }[];
} = {
  hero: {
    src: "/clinic/hero.jpg",
    alt: {
      ru: "Врач-стоматолог Ильгиз Асылбеков в кабинете AsilDent",
      ky: "Тиш доктур Илгиз Асылбеков AsilDent кабинетинде",
    },
  },
  beforeAfter: [
    { before: "/cases/braces-before.jpg", after: "/cases/braces-after.jpg" },
    { before: "/cases/chip-before.jpg", after: "/cases/chip-after.jpg" },
    { before: "/cases/braces-top-before.jpg", after: "/cases/braces-top-after.jpg" },
  ],
  // ДЕМО: фото works/* взяты из постов с меткой Instagram «AI content» —
  // перед официальным запуском подтвердить у клиники, что это реальные работы.
  works: [
    {
      src: "/works/implant-crown.jpg",
      caption: { ru: "Временная коронка на импланте: формируем десну перед постоянной", ky: "Имплантка убактылуу коронка: туруктуу коронкадан мурун бышыкты калыптайбыз" },
    },
    {
      src: "/works/canals-crown.jpg",
      caption: { ru: "Лечение каналов и восстановление зуба под коронку", ky: "Тамырларды дарылоо жана тишти коронка алдында калыбына келтирүү" },
    },
    {
      src: "/works/caries.jpg",
      caption: { ru: "Лечение кариеса жевательных зубов", ky: "Чайноочу тиштердин кариесин дарылоо" },
    },
  ],
};
