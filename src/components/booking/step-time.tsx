"use client";

import { CalendarDays, RotateCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { formatDateLong, formatTime, toMinutesOfDay, type DateKey } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { ApiSlot, WizardDoctor } from "./types";
import { useSlots } from "./use-booking-api";

const PERIODS = [
  { key: "morning", from: 0, to: 12 * 60 },
  { key: "day", from: 12 * 60, to: 17 * 60 },
  { key: "evening", from: 17 * 60, to: 24 * 60 },
] as const;

export function StepTime({
  serviceId,
  doctor,
  doctors,
  date,
  locale,
  selected,
  onSelect,
  onChangeDate,
}: {
  serviceId: string;
  doctor: string;
  doctors: WizardDoctor[];
  date: DateKey;
  locale: string;
  selected?: string;
  onSelect: (time: string) => void;
  onChangeDate: () => void;
}) {
  const t = useTranslations("booking");
  const tc = useTranslations("common");
  const { data, loading, error, reload } = useSlots(serviceId, doctor, date);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-medium text-ink first-letter:uppercase">
          <CalendarDays className="size-4 text-primary" aria-hidden />
          <span className="first-letter:uppercase">{formatDateLong(date, locale)}</span>
        </p>
        <Button variant="link" className="h-auto p-0" onClick={onChangeDate}>
          {t("summary.change")}
        </Button>
      </div>

      {loading && <TimeSkeleton />}
      {error && (
        <div className="rounded-3xl border border-dashed p-8 text-center">
          <p className="text-muted-foreground">{t("errors.loadFailed")}</p>
          <Button variant="outline" className="mt-4" onClick={reload}>
            <RotateCw /> {tc("retry")}
          </Button>
        </div>
      )}
      {data && data.slots.length === 0 && (
        <div className="rounded-3xl border border-dashed p-8 text-center">
          <p className="text-muted-foreground">{t("time.none")}</p>
          <Button variant="outline" className="mt-4" onClick={onChangeDate}>
            {t("steps.date")}
          </Button>
        </div>
      )}
      {data && data.slots.length > 0 && (
        <TimeGrid
          slots={data.slots}
          selected={selected}
          onSelect={onSelect}
          doctorName={doctor !== "any" ? doctors.find((d) => d.id === doctor)?.name : undefined}
        />
      )}
    </div>
  );
}

export function TimeGrid({
  slots,
  selected,
  onSelect,
  doctorName,
}: {
  slots: ApiSlot[];
  selected?: string;
  onSelect: (time: string) => void;
  doctorName?: string;
}) {
  const t = useTranslations("booking.time");
  const times = slots.map((s) => formatTime(new Date(s.start)));
  const initial = Math.max(0, selected ? times.indexOf(selected) : 0);
  const [focusIndex, setFocusIndex] = useState(initial);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  // Количество колонок в строке — чтобы стрелки вверх/вниз двигались по сетке.
  function columns(index: number) {
    const el = refs.current[index];
    const top = el?.offsetTop;
    const parent = el?.parentElement?.parentElement;
    if (!parent || top === undefined) return 4;
    return [...parent.querySelectorAll("button")].filter((b) => (b as HTMLElement).offsetTop === top).length || 4;
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const cols = columns(index);
    const map: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      ArrowDown: index + cols,
      ArrowUp: index - cols,
      Home: 0,
      End: times.length - 1,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    const next = Math.min(times.length - 1, Math.max(0, map[e.key]));
    setFocusIndex(next);
    refs.current[next]?.focus();
  }

  return (
    <div className="space-y-6">
      {doctorName && <p className="text-sm text-muted-foreground">{t("doctorAt", { name: doctorName })}</p>}
      <p className="sr-only">{t("keyboardHint")}</p>
      {PERIODS.map((p) => {
        const items = slots
          .map((s, i) => ({ slot: s, time: times[i], index: i }))
          .filter(({ slot }) => {
            const m = toMinutesOfDay(new Date(slot.start));
            return m >= p.from && m < p.to;
          });
        if (items.length === 0) return null;
        return (
          <section key={p.key} aria-labelledby={`period-${p.key}`}>
            <h3 id={`period-${p.key}`} className="mb-3 font-sans text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {t(p.key)}
            </h3>
            <div role="group" aria-labelledby={`period-${p.key}`}>
              <ul className="grid grid-cols-3 gap-2 min-[420px]:grid-cols-4 sm:grid-cols-5 md:grid-cols-6">
                {items.map(({ time, index }) => {
                  const active = selected === time;
                  return (
                    <li key={time}>
                      <button
                        ref={(el) => {
                          refs.current[index] = el;
                        }}
                        type="button"
                        tabIndex={index === focusIndex ? 0 : -1}
                        aria-pressed={active}
                        onKeyDown={(e) => onKeyDown(e, index)}
                        onFocus={() => setFocusIndex(index)}
                        onClick={() => onSelect(time)}
                        className={cn(
                          "h-12 w-full rounded-2xl border bg-card text-[0.95rem] font-semibold text-ink tabular-nums transition-colors hover:border-primary hover:bg-primary-soft",
                          active && "border-primary bg-primary text-primary-foreground hover:bg-primary-hover",
                        )}
                      >
                        {time}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function TimeSkeleton() {
  return (
    <div className="grid animate-pulse grid-cols-3 gap-2 min-[420px]:grid-cols-4 sm:grid-cols-5 md:grid-cols-6" aria-hidden>
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="h-12 rounded-2xl bg-muted" />
      ))}
    </div>
  );
}
