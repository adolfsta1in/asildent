import { Clock, MapPin, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { InstagramIcon, TelegramIcon, WhatsAppIcon } from "@/components/icons";
import { MapEmbed } from "@/components/home/map-embed";
import type { Locale } from "@/i18n/routing";
import { instagramHref, telegramHref, telHref, whatsappHref } from "@/lib/format";
import { tr } from "@/lib/localized";
import type { ClinicSettings } from "@/lib/settings";
import { WorkingHours } from "./working-hours";

/** Блок контактов: адрес, телефоны, мессенджеры, часы работы и карта. */
export async function ContactDetails({ clinic, locale }: { clinic: ClinicSettings; locale: Locale }) {
  const [t, tc] = await Promise.all([
    getTranslations({ locale, namespace: "home.contacts" }),
    getTranslations({ locale, namespace: "cta" }),
  ]);
  const address = tr(clinic.address, locale);

  const messengers = [
    clinic.whatsapp && { href: whatsappHref(clinic.whatsapp), label: tc("whatsapp"), Icon: WhatsAppIcon, color: "text-[#1DA851]" },
    clinic.telegram && { href: telegramHref(clinic.telegram), label: tc("telegram"), Icon: TelegramIcon, color: "text-[#229ED9]" },
    clinic.instagram && { href: instagramHref(clinic.instagram), label: tc("instagram"), Icon: InstagramIcon, color: "text-[#D62976]" },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof WhatsAppIcon; color: string }[];

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <div className="rounded-3xl border bg-card p-6 sm:p-7">
          <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            <MapPin className="size-4 text-primary" aria-hidden /> {t("address")}
          </h3>
          <p className="mt-3 font-heading text-xl font-bold text-ink">{address}</p>
          <p className="mt-2 text-sm text-muted-foreground">{tr(clinic.addressNote, locale)}</p>
          <a
            href={clinic.twoGisUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            {tc("route")} →
          </a>
        </div>

        <div className="rounded-3xl border bg-card p-6 sm:p-7">
          <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            <Phone className="size-4 text-primary" aria-hidden /> {t("phones")}
          </h3>
          <ul className="mt-3 space-y-1">
            {clinic.phones.map((p) => (
              <li key={p}>
                <a href={telHref(p)} className="font-heading text-xl font-bold text-ink transition-colors hover:text-primary">
                  {p}
                </a>
              </li>
            ))}
          </ul>
          <ul className="mt-4 flex flex-wrap gap-2" aria-label={t("messengers")}>
            {messengers.map(({ href, label, Icon, color }) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:bg-muted"
                >
                  <Icon className={`size-4 ${color}`} /> {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border bg-card p-6 sm:col-span-2 sm:p-7 lg:col-span-1">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            <Clock className="size-4 text-primary" aria-hidden /> {t("hours")}
          </h3>
          <WorkingHours hours={clinic.workingHours} locale={locale} className="text-base" />
        </div>
      </div>

      <MapEmbed
        embedUrl={clinic.mapEmbedUrl}
        routeUrl={clinic.twoGisUrl}
        title={t("mapTitle", { name: clinic.name })}
        address={address}
        labels={{ route: tc("route"), load: t("loadMap") }}
      />
    </div>
  );
}
