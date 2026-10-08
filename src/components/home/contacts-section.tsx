import { getTranslations } from "next-intl/server";
import { ContactDetails } from "@/components/site/contact-details";
import { SectionHeading } from "@/components/site/section-heading";
import type { Locale } from "@/i18n/routing";
import type { ClinicSettings } from "@/lib/settings";

export async function ContactsSection({ clinic, locale }: { clinic: ClinicSettings; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "home.contacts" });
  return (
    <section className="section bg-surface" aria-labelledby="contacts-title" id="contacts">
      <div className="container-page">
        <SectionHeading id="contacts-title" eyebrow={t("eyebrow")} title={t("title")} />
        <ContactDetails clinic={clinic} locale={locale} />
      </div>
    </section>
  );
}
