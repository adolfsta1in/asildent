import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BeforeAfter } from "@/components/home/before-after";
import { media } from "@/config/media";
import { Benefits } from "@/components/home/benefits";
import { ClinicGallery } from "@/components/home/clinic-gallery";
import { ContactsSection } from "@/components/home/contacts-section";
import { DoctorsSection } from "@/components/home/doctors-section";
import { Faq } from "@/components/home/faq";
import { Hero } from "@/components/home/hero";
import { PopularServices } from "@/components/home/popular-services";
import { Reviews } from "@/components/home/reviews";
import { Steps } from "@/components/home/steps";
import { CtaBand } from "@/components/site/cta-band";
import { SectionHeading } from "@/components/site/section-heading";
import { getLocale } from "@/lib/locale";
import { pageAlternates } from "@/lib/seo/metadata";
import { getClinic } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { alternates: pageAlternates(locale, "/") };
}

export default async function HomePage() {
  const locale = await getLocale();
  const [clinic, tba, tct] = await Promise.all([
    getClinic(),
    getTranslations({ locale, namespace: "home.beforeAfter" }),
    getTranslations({ locale, namespace: "home.clinicTour" }),
  ]);

  return (
    <>
      <Hero clinic={clinic} locale={locale} />
      <Benefits locale={locale} />
      <PopularServices locale={locale} />
      <DoctorsSection locale={locale} />
      {media.clinic.length > 0 && (
        <section className="section lg:pb-32" aria-labelledby="clinic-title">
          <div className="container-page">
            <SectionHeading id="clinic-title" eyebrow={tct("eyebrow")} title={tct("title")} lead={tct("lead")} />
            <ClinicGallery locale={locale} />
          </div>
        </section>
      )}
      <Steps locale={locale} />
      <section className="section" aria-labelledby="ba-title">
        <div className="container-page">
          <SectionHeading id="ba-title" eyebrow={tba("eyebrow")} title={tba("title")} lead={tba("lead")} />
          <BeforeAfter
            labels={{
              before: tba("before"),
              after: tba("after"),
              placeholder: tba("placeholder"),
              slider: tba("sliderLabel"),
              cases: [tba("cases.1"), tba("cases.2"), tba("cases.3")],
            }}
            images={media.beforeAfter}
          />
        </div>
      </section>
      <Reviews locale={locale} />
      <Faq locale={locale} />
      <ContactsSection clinic={clinic} locale={locale} />
      <CtaBand clinic={clinic} locale={locale} />
    </>
  );
}
