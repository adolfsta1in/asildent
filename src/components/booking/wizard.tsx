"use client";

import { domAnimation, LazyMotion, m, useReducedMotion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useForm, type Resolver } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { isDateKey } from "@/lib/time";
import type { ContactValues } from "@/lib/validators/booking";
import { cn } from "@/lib/utils";
import { StepDoctor } from "./step-doctor";
import { StepService } from "./step-service";
import { StepTime } from "./step-time";
import { Success } from "./success";
import { Summary } from "./summary";
import { STEPS, type StepId, type WizardData } from "./types";

// Календарь и форма контактов (react-day-picker, маска телефона) грузятся только когда до них дошли —
// стартовый JS страницы записи и префетч ссылок на неё остаются лёгкими.
const StepSkeleton = () => <div className="h-72 animate-pulse rounded-3xl bg-muted" aria-hidden />;
const StepDate = dynamic(() => import("./step-date").then((m) => m.StepDate), { loading: StepSkeleton });
const StepContacts = dynamic(() => import("./step-contacts").then((m) => m.StepContacts), { loading: StepSkeleton });

/** zod-резолвер подгружается лениво — при первой валидации формы. */
const lazyResolver: Resolver<ContactValues> = async (values, context, options) => {
  const [{ zodResolver }, { contactSchema }] = await Promise.all([
    import("@hookform/resolvers/zod"),
    import("@/lib/validators/booking"),
  ]);
  return zodResolver(contactSchema)(values, context, options);
};
import type { BookingConfirmation } from "@/lib/booking/create";

export type { WizardData } from "./types";

type Params = { service?: string; doctor?: string; date?: string; time?: string };

export function BookingWizard({ data }: { data: WizardData }) {
  const t = useTranslations("booking");
  const tc = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const reduceMotion = useReducedMotion();

  // --- Состояние мастера хранится в URL: работает «назад» в браузере и ссылки с предвыбором.
  const service = data.services.find((s) => s.slug === sp.get("service"));
  const doctorParam = sp.get("doctor");
  const doctorBySlug = data.doctors.find((d) => d.slug === doctorParam);
  // Врач, который не оказывает выбранную услугу, считается не выбранным.
  const doctor =
    doctorParam === "any"
      ? ("any" as const)
      : doctorBySlug && (!service || service.doctorIds.includes(doctorBySlug.id))
        ? doctorBySlug
        : undefined;
  const rawDate = sp.get("date");
  const date = rawDate && isDateKey(rawDate) ? rawDate : undefined;
  const rawTime = sp.get("time");
  const time = rawTime && /^\d{2}:\d{2}$/.test(rawTime) ? rawTime : undefined;

  const step: StepId = !service ? "service" : !doctor ? "doctor" : !date ? "date" : !time ? "time" : "contacts";
  const stepIndex = STEPS.indexOf(step);

  // Шаги меняются через History API: Next.js синхронизирует его с useSearchParams без запроса к серверу,
  // поэтому переходы мгновенные, а кнопка «назад» в браузере возвращает на предыдущий шаг.
  function navigate(next: Params, replace = false) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) if (v) params.set(k, v);
    const href = `${pathname}${params.size ? `?${params}` : ""}`;
    if (replace) window.history.replaceState(null, "", href);
    else window.history.pushState(null, "", href);
  }

  const current: Params = {
    service: service?.slug,
    doctor: doctor === "any" ? "any" : (doctor?.slug ?? (service ? undefined : doctorBySlug?.slug)),
    date,
    time,
  };

  function goToStep(target: StepId) {
    const i = STEPS.indexOf(target);
    navigate({
      service: i > 0 ? current.service : undefined,
      // Врач, выбранный заранее (со страницы врача), сохраняется при смене услуги.
      doctor: i > 1 ? current.doctor : i === 0 && doctorBySlug ? doctorBySlug.slug : undefined,
      date: i > 2 ? current.date : undefined,
      time: i > 3 ? current.time : undefined,
    });
  }

  // --- Форма контактов живёт на уровне мастера, чтобы введённое не терялось при смене времени.
  const form = useForm<ContactValues>({
    resolver: lazyResolver,
    defaultValues: { name: "", phone: "", comment: "", consent: false as unknown as true },
    mode: "onTouched",
  });

  // --- Управление фокусом: при смене шага фокус переходит на заголовок шага (для клавиатуры и скринридеров).
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    const top = headingRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 80 || top > window.innerHeight * 0.6) {
      window.scrollTo({ top: window.scrollY + top - 120, behavior: "smooth" });
    }
  }, [step, confirmation]);

  if (confirmation) {
    return <Success booking={confirmation} clinic={data.clinic} headingRef={headingRef} />;
  }

  const servicesForStep =
    doctorBySlug && !service ? data.services.filter((s) => s.doctorIds.includes(doctorBySlug.id)) : data.services;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_22rem] lg:gap-10">
      <div className="min-w-0">
        <StepIndicator current={stepIndex} onSelect={goToStep} />

        <div className="mt-8 flex items-start gap-3">
          {stepIndex > 0 && (
            <Button
              variant="outline"
              size="icon"
              className="mt-0.5 shrink-0"
              onClick={() => goToStep(STEPS[stepIndex - 1])}
              aria-label={tc("back")}
            >
              <ArrowLeft />
            </Button>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {t("stepOf", { current: stepIndex + 1, total: STEPS.length })}
            </p>
            <h2 ref={headingRef} tabIndex={-1} className="mt-0.5 text-2xl font-bold outline-none sm:text-3xl">
              {t(`${step}.title`)}
            </h2>
          </div>
        </div>

        <LazyMotion features={domAnimation} strict>
          <m.div
            key={step}
            className="mt-6"
            initial={reduceMotion ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === "service" && (
              <StepService
                services={servicesForStep}
                categories={data.categories}
                selected={service?.id}
                doctorFilter={!service ? doctorBySlug?.name : undefined}
                onClearDoctor={() => navigate({})}
                onSelect={(s) =>
                  navigate({
                    service: s.slug,
                    // Если пришли от врача и он оказывает услугу — сразу к выбору даты.
                    doctor: doctorBySlug && s.doctorIds.includes(doctorBySlug.id) ? doctorBySlug.slug : undefined,
                    date: doctorBySlug && s.doctorIds.includes(doctorBySlug.id) ? date : undefined,
                    time: doctorBySlug && s.doctorIds.includes(doctorBySlug.id) ? time : undefined,
                  })
                }
              />
            )}
            {step === "doctor" && service && (
              <StepDoctor
                doctors={data.doctors.filter((d) => service.doctorIds.includes(d.id))}
                selected={doctor === "any" ? "any" : doctor?.id}
                onSelect={(d) => navigate({ service: service.slug, doctor: d === "any" ? "any" : d.slug })}
              />
            )}
            {step === "date" && service && doctor && (
              <StepDate
                serviceId={service.id}
                doctor={doctor === "any" ? "any" : doctor.id}
                horizonDays={data.clinic.horizonDays}
                selected={date}
                locale={locale}
                onSelect={(d) => navigate({ ...current, date: d, time: undefined })}
              />
            )}
            {step === "time" && service && doctor && date && (
              <StepTime
                serviceId={service.id}
                doctor={doctor === "any" ? "any" : doctor.id}
                doctors={data.doctors}
                date={date}
                locale={locale}
                selected={time}
                onSelect={(tm) => navigate({ ...current, time: tm })}
                onChangeDate={() => goToStep("date")}
              />
            )}
            {step === "contacts" && service && doctor && date && time && (
              <StepContacts
                form={form}
                service={service}
                doctor={doctor}
                date={date}
                time={time}
                locale={locale}
                onTimeUnavailable={() => navigate({ ...current, time: undefined }, true)}
                onPickAlternative={(d, tm) => navigate({ ...current, date: d, time: tm })}
                onSuccess={setConfirmation}
              />
            )}
          </m.div>
        </LazyMotion>
      </div>

      <Summary
        service={service}
        doctor={doctor}
        date={date}
        time={time}
        locale={locale}
        onEdit={goToStep}
        className={cn(step === "service" && "hidden lg:block")}
      />
    </div>
  );
}

function StepIndicator({ current, onSelect }: { current: number; onSelect: (s: StepId) => void }) {
  const t = useTranslations("booking.steps");
  return (
    <nav aria-label="Booking steps">
      <ol className="flex items-center gap-1.5 sm:gap-2">
        {STEPS.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s} className="flex flex-1 flex-col gap-2">
              <span
                aria-hidden
                className={cn(
                  "h-1.5 rounded-full transition-colors duration-500",
                  done ? "bg-primary" : active ? "bg-primary/45" : "bg-border",
                )}
              />
              {done ? (
                <button
                  type="button"
                  onClick={() => onSelect(s)}
                  className="flex items-center gap-1 rounded text-left text-xs font-medium text-primary hover:underline sm:text-sm"
                >
                  <Check className="hidden size-3.5 sm:block" aria-hidden />
                  <span className="truncate">{t(s)}</span>
                </button>
              ) : (
                <span
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "truncate text-xs sm:text-sm",
                    active ? "font-semibold text-ink" : "text-muted-foreground",
                  )}
                >
                  {t(s)}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
