import type { ClinicSettings } from "@/lib/settings";
import { instagramHref, telegramHref } from "@/lib/format";
import { tr } from "@/lib/localized";
import { siteUrl } from "@/lib/site";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function localizedUrl(locale: string, path: string): string {
  const prefix = locale === "ru" ? "" : `/${locale}`;
  const p = path === "/" ? "" : path;
  return `${siteUrl()}${prefix}${p}` || siteUrl();
}

export function clinicJsonLd(clinic: ClinicSettings, locale: string) {
  const hours = Object.entries(clinic.workingHours)
    .filter(([, v]) => v)
    .map(([day, v]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${DAY_NAMES[Number(day)]}`,
      opens: v!.open,
      closes: v!.close,
    }));

  return {
    "@context": "https://schema.org",
    "@type": ["Dentist", "MedicalClinic"],
    "@id": `${siteUrl()}/#clinic`,
    name: clinic.name,
    description: tr(clinic.description, locale),
    url: localizedUrl(locale, "/"),
    telephone: clinic.phones[0],
    email: clinic.email,
    image: clinic.logoUrl ? new URL(clinic.logoUrl, siteUrl()).toString() : localizedUrl(locale, "/opengraph-image"),
    logo: clinic.logoUrl ? new URL(clinic.logoUrl, siteUrl()).toString() : undefined,
    priceRange: "$$",
    currenciesAccepted: "KGS",
    address: {
      "@type": "PostalAddress",
      streetAddress: tr(clinic.address, locale),
      addressLocality: "Бишкек",
      addressCountry: "KG",
    },
    geo: { "@type": "GeoCoordinates", latitude: clinic.lat, longitude: clinic.lng },
    hasMap: clinic.twoGisUrl,
    openingHoursSpecification: hours,
    sameAs: [
      clinic.instagram && instagramHref(clinic.instagram),
      clinic.telegram && telegramHref(clinic.telegram),
      clinic.twoGisUrl,
    ].filter(Boolean),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
