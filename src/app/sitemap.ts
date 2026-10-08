import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getCatalog, getDoctors } from "@/lib/data";
import { localizedUrl } from "@/lib/seo/jsonld";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ services }, doctors] = await Promise.all([getCatalog(), getDoctors()]);
  const pages: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/uslugi", priority: 0.9 },
    { path: "/vrachi", priority: 0.8 },
    { path: "/booking", priority: 0.9 },
    { path: "/o-klinike", priority: 0.6 },
    { path: "/kontakty", priority: 0.7 },
    { path: "/privacy", priority: 0.2 },
    ...services.map((s) => ({ path: `/uslugi/${s.slug}`, priority: 0.7 })),
    ...doctors.map((d) => ({ path: `/vrachi/${d.slug}`, priority: 0.6 })),
  ];

  return pages.flatMap(({ path, priority }) =>
    routing.locales.map((locale) => ({
      url: localizedUrl(locale, path),
      changeFrequency: "weekly" as const,
      priority: locale === routing.defaultLocale ? priority : priority * 0.9,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l === "ky" ? "ky-KG" : "ru-RU", localizedUrl(l, path)])),
      },
    })),
  );
}
