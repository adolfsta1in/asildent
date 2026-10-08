"use client";

import { CalendarPlus, Check, Home, MapPin } from "lucide-react";
import { domAnimation, LazyMotion, m, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import type { RefObject } from "react";
import { WhatsAppIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { BookingConfirmation } from "@/lib/booking/create";
import { whatsappHref } from "@/lib/format";
import { tr } from "@/lib/localized";
import { formatDateLong, formatTime } from "@/lib/time";
import { cn } from "@/lib/utils";

export function Success({
  booking,
  clinic,
  headingRef,
}: {
  booking: BookingConfirmation;
  clinic: { name: string; address: string; phone: string; whatsapp: string };
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const t = useTranslations("booking");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const start = new Date(booking.start);
  const end = new Date(booking.end);

  const details: { label: string; value: string; capitalize?: boolean }[] = [
    { label: t("summary.service"), value: tr(booking.serviceName, locale) },
    { label: t("summary.doctor"), value: tr(booking.doctorName, locale) },
    { label: t("summary.date"), value: formatDateLong(start, locale), capitalize: true },
    { label: t("summary.time"), value: `${formatTime(start)}–${formatTime(end)}` },
    { label: t("success.address"), value: clinic.address },
  ];

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-2xl"
      >
        <div className="overflow-hidden rounded-[2rem] border bg-card shadow-lift">
          <div className="bg-primary px-6 py-10 text-center text-primary-foreground sm:px-10">
            <m.span
              initial={reduce ? false : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 18 }}
              className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary-foreground text-primary"
            >
              <Check className="size-8" strokeWidth={3} aria-hidden />
            </m.span>
            <h2 ref={headingRef} tabIndex={-1} className="mt-5 text-3xl font-bold text-primary-foreground outline-none">
              {t("success.title")}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-primary-foreground/85">{t("success.lead")}</p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-black/10 px-4 py-2 text-sm">
              {t("success.code")}: <strong className="font-heading tracking-widest">{booking.code}</strong>
            </p>
          </div>

          <dl className="divide-y px-6 sm:px-10">
            {details.map((d) => (
              <div key={d.label} className="flex flex-col gap-0.5 py-4 sm:flex-row sm:justify-between sm:gap-6">
                <dt className="text-sm text-muted-foreground">{d.label}</dt>
                <dd className={cn("font-semibold text-ink sm:text-right", d.capitalize && "first-letter:uppercase")}>{d.value}</dd>
              </div>
            ))}
          </dl>

          <div className="grid gap-2 border-t bg-surface/60 p-6 sm:grid-cols-2 sm:px-10">
            <Button asChild size="lg">
              <a href={`/api/appointments/${booking.code}/ics?lang=${locale}`} download>
                <CalendarPlus /> {t("success.addToCalendar")}
              </a>
            </Button>
            {clinic.whatsapp && (
              <Button asChild size="lg" variant="outline" className="bg-card">
                <a
                  href={whatsappHref(clinic.whatsapp, t("success.whatsappText", { code: booking.code }))}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon className="size-5 text-[#1DA851]" /> {t("success.whatsapp")}
                </a>
              </Button>
            )}
          </div>
        </div>

        <p className="mt-6 flex items-start justify-center gap-2 text-center text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden /> {t("success.reminder")}
        </p>
        <div className="mt-4 text-center">
          <Button asChild variant="ghost">
            <Link href="/">
              <Home /> {t("success.home")}
            </Link>
          </Button>
        </div>
      </m.div>
    </LazyMotion>
  );
}
