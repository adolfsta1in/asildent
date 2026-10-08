"use client";

import { CalendarDays, Clock, Stethoscope, UserRound, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { formatDateLong, type DateKey } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { StepId, WizardDoctor, WizardService } from "./types";

export function Summary({
  service,
  doctor,
  date,
  time,
  locale,
  onEdit,
  className,
}: {
  service?: WizardService;
  doctor?: WizardDoctor | "any";
  date?: DateKey;
  time?: string;
  locale: string;
  onEdit: (step: StepId) => void;
  className?: string;
}) {
  const t = useTranslations("booking");

  const rows: { step: StepId; icon: ReactNode; label: string; value?: string }[] = [
    { step: "service", icon: <Stethoscope />, label: t("summary.service"), value: service?.name },
    {
      step: "doctor",
      icon: <UserRound />,
      label: t("summary.doctor"),
      value: doctor === "any" ? t("doctor.any") : doctor?.name,
    },
    { step: "date", icon: <CalendarDays />, label: t("summary.date"), value: date ? formatDateLong(date, locale) : undefined },
    { step: "time", icon: <Clock />, label: t("summary.time"), value: time },
  ];

  return (
    <aside aria-label={t("summary.title")} className={cn("lg:sticky lg:top-28 lg:self-start", className)}>
      <div className="rounded-3xl border bg-card p-5 shadow-soft sm:p-6">
        <h2 className="font-heading text-lg font-bold">{t("summary.title")}</h2>
        <dl className="mt-4 space-y-3">
          {rows.map((r) => (
            <div key={r.step} className="flex items-start gap-3">
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-xl [&_svg]:size-4",
                  r.value ? "bg-primary-soft text-primary-soft-foreground" : "bg-muted text-muted-foreground",
                )}
                aria-hidden
              >
                {r.icon}
              </span>
              <div className="min-w-0 flex-1">
                <dt className="text-xs text-muted-foreground">{r.label}</dt>
                <dd className={cn("text-sm font-semibold first-letter:uppercase", r.value ? "text-ink" : "text-muted-foreground/60")}>
                  {r.value ?? "—"}
                </dd>
              </div>
              {r.value && (
                <button
                  type="button"
                  onClick={() => onEdit(r.step)}
                  className="mt-3 text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                  {t("summary.change")}
                  <span className="sr-only">: {r.label}</span>
                </button>
              )}
            </div>
          ))}
        </dl>
        {service && (
          <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="size-4" aria-hidden /> {t("summary.price")}
            </span>
            <span className="font-heading font-bold text-ink">{service.priceLabel}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
