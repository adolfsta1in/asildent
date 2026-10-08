import { getTranslations } from "next-intl/server";
import { CalendarCheck } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";

export async function Steps({ locale }: { locale: Locale }) {
  const [t, tc] = await Promise.all([
    getTranslations({ locale, namespace: "home.steps" }),
    getTranslations({ locale, namespace: "cta" }),
  ]);
  const steps = ["1", "2", "3"] as const;

  return (
    <section className="section bg-ink text-white" aria-labelledby="steps-title">
      <div className="container-page">
        <div className="mb-12 flex flex-col gap-6 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-primary-soft">{t("eyebrow")}</p>
            <h2 id="steps-title" className="section-title mt-3 text-white">
              {t("title")}
            </h2>
          </div>
          <Button asChild size="lg" className="self-start lg:self-auto">
            <Link href="/booking">
              <CalendarCheck /> {tc("book")}
            </Link>
          </Button>
        </div>
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((n) => (
            <Reveal as="li" key={n} className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-7">
              <span className="font-heading text-6xl leading-none font-bold text-primary-soft/30" aria-hidden>
                0{n}
              </span>
              <h3 className="mt-8 text-xl font-bold text-white">{t(`items.${n}.title`)}</h3>
              <p className="mt-3 leading-relaxed text-white/70">{t(`items.${n}.text`)}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

