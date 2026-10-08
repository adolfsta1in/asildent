"use client";

import { RotateCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ru } from "react-day-picker/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { addDays, toDateKey, type DateKey } from "@/lib/time";
import { useAvailability } from "./use-booking-api";

// В кыргызском языке в быту используются русские названия месяцев.
const KY_MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

/** YYYY-MM-DD ↔ локальная дата браузера для календаря (только календарная дата, без времени). */
function keyToLocal(key: DateKey) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function localToKey(date: Date): DateKey {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function StepDate({
  serviceId,
  doctor,
  horizonDays,
  selected,
  locale,
  onSelect,
}: {
  serviceId: string;
  doctor: string;
  horizonDays: number;
  selected?: DateKey;
  locale: string;
  onSelect: (date: DateKey) => void;
}) {
  const t = useTranslations("booking");
  const tc = useTranslations("common");
  const { data, loading, error, reload } = useAvailability(serviceId, doctor);
  const available = useMemo(() => new Set(data?.dates ?? []), [data]);

  // «Сегодня» — по времени клиники, а не браузера.
  const [today] = useState(() => toDateKey(Date.now()));
  const last = addDays(today, horizonDays - 1);
  const firstAvailable = data?.dates[0];

  if (error) {
    return (
      <div className="rounded-3xl border border-dashed p-8 text-center">
        <p className="text-muted-foreground">{t("errors.loadFailed")}</p>
        <Button variant="outline" className="mt-4" onClick={reload}>
          <RotateCw /> {tc("retry")}
        </Button>
      </div>
    );
  }

  if (data && data.dates.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed p-8 text-center text-muted-foreground">
        {t("date.noDays", { days: horizonDays })}
      </p>
    );
  }

  const kyFormatters =
    locale === "ky"
      ? {
          formatCaption: (month: Date) => `${KY_MONTHS[month.getMonth()]} ${month.getFullYear()}`,
          formatWeekdayName: (day: Date) => tc(`weekdaysShort.${String(day.getDay()) as "0"}`),
        }
      : undefined;

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">{t("date.hint")}</p>
      <div className="relative inline-block max-w-full rounded-3xl border bg-card p-3 shadow-soft sm:p-5" aria-busy={loading}>
        <Calendar
          mode="single"
          locale={ru}
          formatters={kyFormatters}
          labels={{
            labelNext: () => t("date.nextMonth"),
            labelPrevious: () => t("date.prevMonth"),
          }}
          selected={selected ? keyToLocal(selected) : undefined}
          onSelect={(d) => d && onSelect(localToKey(d))}
          defaultMonth={keyToLocal(selected ?? firstAvailable ?? today)}
          startMonth={keyToLocal(today)}
          endMonth={keyToLocal(last)}
          showOutsideDays={false}
          disabled={(d) => {
            const key = localToKey(d);
            return loading || key < today || key > last || !available.has(key);
          }}
          modifiers={{ available: (d) => available.has(localToKey(d)) }}
          modifiersClassNames={{
            available:
              "[&>button]:font-semibold [&>button]:text-ink [&>button]:after:absolute [&>button]:after:bottom-1.5 [&>button]:after:size-1 [&>button]:after:rounded-full [&>button]:after:bg-primary [&>button[data-selected-single=true]]:after:bg-primary-foreground",
          }}
          className="bg-transparent p-0 [--cell-radius:0.9rem] [--cell-size:--spacing(10.5)] sm:[--cell-size:--spacing(12)]"
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-card/60" role="status">
            <span className="sr-only">{tc("loading")}</span>
            <span className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
          </div>
        )}
      </div>
    </div>
  );
}
