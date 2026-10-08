/** Подписи источника записи в админке. web и admin создаёт сайт; остальные приходят из импорта (WhatsApp, звонки, Instagram). */
const SOURCE_LABEL: Record<string, string> = {
  web: "Сайт",
  admin: "Админка",
  whatsapp: "WhatsApp",
  phone: "Звонок",
  instagram: "Instagram",
};

export function sourceLabel(source: string): string {
  return SOURCE_LABEL[source] ?? source;
}
