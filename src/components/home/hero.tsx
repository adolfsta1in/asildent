import { CalendarCheck, Phone, ShieldCheck, Sparkles, Star } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { media } from "@/config/media";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { formatNumber, telHref } from "@/lib/format";
import { yearsSince } from "@/lib/i18n-format";
import { tr } from "@/lib/localized";
import type { ClinicSettings } from "@/lib/settings";
import { NextSlotCard } from "./next-slot-card";

export async function Hero({ clinic, locale }: { clinic: ClinicSettings; locale: Locale }) {
  const [t, tc, tc2] = await Promise.all([
    getTranslations({ locale, namespace: "home.hero" }),
    getTranslations({ locale, namespace: "cta" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const phone = clinic.phones[0];

  // patientsCount = 0 — число неизвестно, плашку не показываем.
  const stats = [
    { value: `${yearsSince(clinic.foundedYear)}`, label: t("statYears") },
    ...(clinic.patientsCount > 0
      ? [{ value: `${formatNumber(clinic.patientsCount)}+`, label: t("statPatients") }]
      : []),
    { value: clinic.rating.toFixed(1).replace(".", ","), label: t("statRating"), star: true },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Мягкий фон с точечной сеткой справа */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] bg-surface lg:block">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
      </div>

      <div className="container-page relative grid items-center gap-12 pt-8 pb-16 sm:pt-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:pt-16 lg:pb-24">
        <div>
          <p className="eyebrow">
            <span className="h-px w-6 bg-primary" aria-hidden />
            {t("eyebrow")}
          </p>
          <h1 className="mt-5 text-[2.6rem] leading-[1.02] font-bold tracking-[-0.035em] sm:text-6xl lg:text-[4.4rem]">
            {tr(clinic.tagline, locale)}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">{t("lead")}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-14 px-7 text-base">
              <Link href="/booking">
                <CalendarCheck /> {tc("book")}
              </Link>
            </Button>
            {phone && (
              <Button asChild size="lg" variant="outline" className="h-14 px-7 text-base">
                <a href={telHref(phone)}>
                  <Phone /> {tc("call")}
                </a>
              </Button>
            )}
          </div>

          <dl
            className={`mt-12 grid max-w-lg ${stats.length === 3 ? "grid-cols-3" : "grid-cols-2"} gap-4 border-t pt-8`}
          >
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="flex items-center gap-1.5 font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                  {s.value}
                  {s.star && <Star className="size-5 fill-warning text-warning" aria-hidden />}
                </dd>
                <dd className="mt-1 text-sm leading-snug text-muted-foreground">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <HeroVisual
          locale={locale}
          labels={{
            sterile: t("badgeSterile"),
            painless: t("badgePainless"),
            nextSlot: t("nextSlot"),
            nextSlotCta: t("nextSlotCta"),
            today: tc2("today"),
            tomorrow: tc2("tomorrow"),
          }}
        />
      </div>
    </section>
  );
}

function HeroVisual({
  locale,
  labels,
}: {
  locale: Locale;
  labels: { sterile: string; painless: string; nextSlot: string; nextSlotCta: string; today: string; tomorrow: string };
}) {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="relative aspect-[4/4.4] overflow-hidden rounded-[2.25rem] bg-primary-soft sm:aspect-[4/4]">
        {media.hero ? (
          <Image
            src={media.hero.src}
            alt={tr(media.hero.alt, locale)}
            fill
            priority
            sizes="(min-width: 1024px) 40vw, (min-width: 640px) 28rem, 100vw"
            className="object-cover"
          />
        ) : (
          <svg
            viewBox="0 0 400 420"
            className="absolute inset-0 size-full"
            aria-hidden
            preserveAspectRatio="xMidYMid slice"
          >
            <circle cx="330" cy="70" r="120" fill="var(--card)" opacity="0.45" />
            <circle cx="60" cy="380" r="110" fill="var(--surface)" opacity="0.7" />
            <g
              transform="translate(110 70) scale(7.5)"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="0.42"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            >
              <path d="M7.5 3.2c1.6-.5 3 .1 4.5.8 1.5-.7 2.9-1.3 4.5-.8 2.6.8 3.8 3.6 3.1 6.7-.4 1.7-1.2 2.9-1.6 4.6-.5 2.2-.6 4.5-1.6 6.1-.6 1-1.9.9-2.3-.2-.5-1.4-.6-3.6-2.1-3.6s-1.6 2.2-2.1 3.6c-.4 1.1-1.7 1.2-2.3.2-1-1.6-1.1-3.9-1.6-6.1-.4-1.7-1.2-2.9-1.6-4.6-.7-3.1.5-5.9 3.1-6.7Z" />
              <path d="M9 7.2c1 .1 2 .5 3 1" />
            </g>
            <g stroke="var(--primary)" strokeOpacity="0.18" strokeWidth="1">
              {Array.from({ length: 7 }, (_, i) => (
                <line key={i} x1="0" x2="400" y1={60 + i * 50} y2={60 + i * 50} strokeDasharray="2 6" />
              ))}
            </g>
          </svg>
        )}

        <div className="absolute top-5 left-5 flex items-center gap-2 rounded-full bg-card/90 px-3.5 py-2 text-xs font-semibold text-ink shadow-soft backdrop-blur sm:top-7 sm:left-7">
          <ShieldCheck className="size-4 text-primary" aria-hidden />
          {labels.sterile}
        </div>
        <div className="absolute top-16 right-5 flex items-center gap-2 rounded-full bg-card/90 px-3.5 py-2 text-xs font-semibold text-ink shadow-soft backdrop-blur sm:top-20 sm:right-7">
          <Sparkles className="size-4 text-accent-foreground" aria-hidden />
          {labels.painless}
        </div>
      </div>

      <div className="absolute inset-x-4 -bottom-8 sm:inset-x-8">
        <NextSlotCard
          locale={locale}
          labels={{ title: labels.nextSlot, cta: labels.nextSlotCta, today: labels.today, tomorrow: labels.tomorrow }}
        />
      </div>
    </div>
  );
}
