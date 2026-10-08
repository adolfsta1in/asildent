import { Info, Quote, Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import type { Locale } from "@/i18n/routing";
import { getReviews } from "@/lib/data";
import { tr } from "@/lib/localized";
import { cn } from "@/lib/utils";

export async function Reviews({ locale }: { locale: Locale }) {
  const [reviews, t, tc] = await Promise.all([
    getReviews(),
    getTranslations({ locale, namespace: "home.reviews" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  if (reviews.length === 0) return null;
  const hasDemo = reviews.some((r) => r.isDemo);

  return (
    <section className="section bg-surface" aria-labelledby="reviews-title">
      <div className="container-page">
        <SectionHeading
          id="reviews-title"
          eyebrow={t("eyebrow")}
          title={t("title")}
          action={
            hasDemo ? (
              <p className="flex max-w-sm items-start gap-2 rounded-2xl border border-dashed bg-card px-4 py-3 text-sm text-muted-foreground">
                <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                {t("demoNote")}
              </p>
            ) : undefined
          }
        />
        <ul className="columns-1 gap-4 md:columns-2 lg:columns-3">
          {reviews.map((r, i) => (
            <Reveal
              as="li"
              key={r.id}
             
              className={cn("mb-4 break-inside-avoid rounded-3xl border bg-card p-6 sm:p-7", i === 0 && "lg:bg-primary-soft")}
            >
              <figure>
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5" role="img" aria-label={t("ratingLabel", { rating: r.rating })}>
                    {Array.from({ length: 5 }, (_, k) => (
                      <Star
                        key={k}
                        className={cn("size-4", k < r.rating ? "fill-warning text-warning" : "text-border")}
                        aria-hidden
                      />
                    ))}
                  </div>
                  <Quote className="size-6 text-primary/30" aria-hidden />
                </div>
                <blockquote className="mt-4 leading-relaxed text-foreground/90">{tr(r.text, locale)}</blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t pt-4">
                  <span className="flex size-10 items-center justify-center rounded-full bg-secondary font-heading text-sm font-bold text-secondary-foreground">
                    {r.authorName[0]}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink">{r.authorName}</span>
                    {r.serviceName && (
                      <span className="block text-xs text-muted-foreground">{tr(r.serviceName, locale)}</span>
                    )}
                  </span>
                  {r.isDemo && (
                    <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                      {tc("demoBadge")}
                    </span>
                  )}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
