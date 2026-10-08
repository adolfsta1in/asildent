import Link from "next/link";
import type { AdminAppointment } from "@/lib/admin/appointments";
import { STATUS_META, isStatus } from "@/lib/appointment-status";
import { tr } from "@/lib/localized";
import { addDays, formatTime, toDateKey, type DateKey } from "@/lib/time";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function WeekView({ weekStart, today, appointments }: { weekStart: DateKey; today: DateKey; appointments: AdminAppointment[] }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="grid min-w-[56rem] grid-cols-7 gap-2">
        {days.map((day, i) => {
          const items = appointments.filter((a) => toDateKey(a.startAt) === day);
          return (
            <section key={day} aria-label={day} className={cn("rounded-2xl border bg-card p-2", day === today && "border-primary ring-2 ring-primary/15")}>
              <Link
                href={`/admin/appointments?view=day&date=${day}`}
                className="mb-2 flex items-baseline justify-between rounded-lg px-1.5 py-1 hover:bg-muted"
              >
                <span className="text-xs font-semibold text-muted-foreground uppercase">{WEEKDAYS[i]}</span>
                <span className={cn("font-heading text-lg font-bold", day === today ? "text-primary" : "text-ink")}>
                  {Number(day.slice(8))}
                </span>
              </Link>
              <ul className="space-y-1.5">
                {items.length === 0 && <li className="px-1.5 py-3 text-center text-xs text-muted-foreground/70">—</li>}
                {items.map((a) => {
                  const meta = isStatus(a.status) ? STATUS_META[a.status] : null;
                  return (
                    <li key={a.id}>
                      <Link
                        href={`/admin/appointments/${a.id}`}
                        className={cn(
                          "block rounded-xl bg-surface px-2 py-1.5 text-xs transition-colors hover:bg-primary-soft",
                          (a.status === "CANCELLED" || a.status === "NO_SHOW") && "opacity-55",
                        )}
                      >
                        <span className="flex items-center gap-1.5 font-semibold text-ink tabular-nums">
                          <span className={cn("size-1.5 shrink-0 rounded-full", meta?.dot)} aria-hidden />
                          {formatTime(a.startAt)}
                        </span>
                        <span className="block truncate font-medium text-ink">{a.patientName}</span>
                        <span className="block truncate text-muted-foreground">{tr(a.doctor.name, "ru")}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
