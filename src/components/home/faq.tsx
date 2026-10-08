import { ChevronDown } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/site/json-ld";
import { SectionHeading } from "@/components/site/section-heading";
import type { Locale } from "@/i18n/routing";
import { getFaqs } from "@/lib/data";
import { tr } from "@/lib/localized";

/** FAQ на нативных <details>: доступно с клавиатуры и для скринридеров, без JavaScript. */
export async function Faq({ locale }: { locale: Locale }) {
  const [faqs, t] = await Promise.all([getFaqs(), getTranslations({ locale, namespace: "home.faq" })]);
  if (faqs.length === 0) return null;

  return (
    <section className="section" aria-labelledby="faq-title">
      <div className="container-page grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHeading id="faq-title" eyebrow={t("eyebrow")} title={t("title")} className="lg:sticky lg:top-28 lg:self-start" />
        <div className="divide-y rounded-3xl border bg-card px-2 sm:px-4">
          {faqs.map((f) => (
            <details key={f.id} name="faq" className="group px-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl py-5 font-heading text-base font-semibold text-ink sm:text-lg [&::-webkit-details-marker]:hidden">
                {tr(f.question, locale)}
                <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180" aria-hidden />
              </summary>
              <p className="pb-5 text-[0.98rem] leading-relaxed text-muted-foreground">{tr(f.answer, locale)}</p>
            </details>
          ))}
        </div>
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: tr(f.question, locale),
            acceptedAnswer: { "@type": "Answer", text: tr(f.answer, locale) },
          })),
        }}
      />
    </section>
  );
}
