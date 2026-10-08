export function siteUrl(): string {
  return (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

/** Публичные разделы сайта (используются в шапке, подвале и sitemap). */
export const NAV_ITEMS = [
  { href: "/uslugi", key: "services" },
  { href: "/vrachi", key: "doctors" },
  { href: "/o-klinike", key: "about" },
  { href: "/kontakty", key: "contacts" },
] as const;
