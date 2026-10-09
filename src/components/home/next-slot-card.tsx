"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { ToothIcon } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { tr } from "@/lib/localized";
import { relativeDayLabel } from "@/lib/relative-day";
import { formatTime, toDateKey } from "@/lib/time";

type Slot = { start: string; doctorSlug: string; doctorName: unknown } | null;

/**
 * «Ближайшее свободное время» — подгружается в браузере, чтобы главная оставалась
 * полностью статической (быстрая отдача с CDN). Высота зафиксирована — без сдвига макета.
 */
export function NextSlotCard({
  locale,
  labels,
  doctorSlug,
}: {
  locale: string;
  /** Только окна этого врача (когда на фото рядом — он). */
  doctorSlug?: string;
  labels: { title: string; cta: string; today: string; tomorrow: string };
}) {
  const [state, setState] = useState<{ slot: Slot; now: number } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(doctorSlug ? `/api/next-slot?doctor=${doctorSlug}` : "/api/next-slot", { signal: controller.signal })
      .then((r) => r.json())
      .then((d: { slot: Slot }) => setState({ slot: d.slot, now: Date.now() }))
      .catch(() => {});
    return () => controller.abort();
  }, [doctorSlug]);

  if (!state) return <div className="h-[5.5rem] animate-pulse rounded-3xl border bg-card/90 shadow-lift sm:h-[6.25rem]" aria-hidden />;
  if (!state.slot) return null;

  const start = new Date(state.slot.start);
  const day = relativeDayLabel(start, locale, { today: labels.today, tomorrow: labels.tomorrow }, new Date(state.now));
  const href = `/booking?doctor=${state.slot.doctorSlug}&date=${toDateKey(start)}&time=${formatTime(start)}`;

  return (
    <Link
      href={href}
      className="group flex h-[5.5rem] items-center gap-4 rounded-3xl border bg-card/95 px-4 shadow-lift backdrop-blur transition-transform hover:-translate-y-0.5 sm:h-[6.25rem] sm:px-5"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <ToothIcon className="size-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium text-muted-foreground">{labels.title}</span>
        <span className="mt-0.5 block truncate font-heading text-lg font-bold text-ink first-letter:uppercase">
          {day}, {formatTime(start)}
        </span>
        <span className="block truncate text-sm text-muted-foreground">{tr(state.slot.doctorName, locale)}</span>
      </span>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-soft-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <ArrowRight className="size-5" aria-label={labels.cta} />
      </span>
    </Link>
  );
}
