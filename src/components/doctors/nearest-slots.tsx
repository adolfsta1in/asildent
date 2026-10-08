"use client";

import { CalendarClock } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { relativeDayLabel } from "@/lib/relative-day";
import { formatTime, toDateKey } from "@/lib/time";

type Labels = { today: string; tomorrow: string; noSlots: string; loading: string };

/**
 * Ближайшие свободные окна врача. Загружаются в браузере — страница врача остаётся статической.
 * Показываем до 3 ближайших дней и до 6 окон в каждом; высота блока зарезервирована (без сдвига макета).
 */
export function NearestSlots({ doctorSlug, locale, labels }: { doctorSlug: string; locale: string; labels: Labels }) {
  const [state, setState] = useState<{ slots: string[]; now: number } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/doctors/${doctorSlug}/nearest`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d: { slots: string[] }) => setState({ slots: d.slots ?? [], now: Date.now() }))
      .catch(() => {});
    return () => controller.abort();
  }, [doctorSlug]);

  if (!state) {
    return (
      <div className="min-h-[15.5rem] space-y-4" aria-busy="true">
        <span className="sr-only">{labels.loading}</span>
        {[0, 1, 2].map((row) => (
          <div key={row} className="animate-pulse space-y-2" aria-hidden>
            <div className="h-5 w-36 rounded bg-muted" />
            <div className="flex gap-2 overflow-hidden pb-1">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-10 w-16 shrink-0 rounded-full bg-muted" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (state.slots.length === 0) {
    return <p className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">{labels.noSlots}</p>;
  }

  const byDay = new Map<string, Date[]>();
  for (const iso of state.slots) {
    const start = new Date(iso);
    const key = toDateKey(start);
    if (!byDay.has(key) && byDay.size >= 3) break;
    const list = byDay.get(key) ?? [];
    if (list.length < 6) byDay.set(key, [...list, start]);
  }
  const now = new Date(state.now);

  return (
    <div className="min-h-[15.5rem] space-y-4">
      {[...byDay.entries()].map(([day, items]) => (
        <div key={day}>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
            <CalendarClock className="size-4 text-primary" aria-hidden />
            <span className="first-letter:uppercase">
              {relativeDayLabel(items[0], locale, { today: labels.today, tomorrow: labels.tomorrow }, now)}
            </span>
          </p>
          <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {items.map((s) => (
              <li key={s.toISOString()} className="shrink-0">
                <Link
                  href={`/booking?doctor=${doctorSlug}&date=${day}&time=${formatTime(s)}`}
                  className="inline-flex h-10 items-center rounded-full border bg-card px-4 text-sm font-semibold text-ink tabular-nums transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  {formatTime(s)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
