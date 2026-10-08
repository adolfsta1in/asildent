const nf = new Intl.NumberFormat("ru-RU");

export function formatNumber(n: number): string {
  return nf.format(n);
}

/** Телефон для ссылки tel: — только цифры и плюс. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function whatsappHref(number: string, text?: string): string {
  const base = `https://wa.me/${number.replace(/\D/g, "")}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function telegramHref(username: string): string {
  return `https://t.me/${username.replace(/^@/, "")}`;
}

export function instagramHref(username: string): string {
  return `https://instagram.com/${username.replace(/^@/, "")}`;
}

/** Склонение: plural(5, ["год", "года", "лет"]) → «лет». */
export function pluralRu(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}
