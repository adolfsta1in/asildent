import Link from "next/link";
import type { AdminAppointment } from "@/lib/admin/appointments";
import { STATUS_META, isStatus } from "@/lib/appointment-status";
import { tr } from "@/lib/localized";
import { workingMinutes, type ScheduleExceptionInput, type ScheduleRuleInput } from "@/lib/slots/engine";
import { formatTime, minutesToHHMM, toMinutesOfDay, type DateKey } from "@/lib/time";
import { cn } from "@/lib/utils";

type DoctorColumn = {
  id: string;
  name: string;
  rules: ScheduleRuleInput[];
  exceptions: ScheduleExceptionInput[];
};

const PX_PER_MIN = 1.5;

/** Расписание дня: колонки по врачам, серым — нерабочее время, блоки — записи. */
export function DayView({ date, doctors, appointments }: { date: DateKey; doctors: DoctorColumn[]; appointments: AdminAppointment[] }) {
  const columns = doctors.map((d) => ({ ...d, work: workingMinutes(date, d.rules, d.exceptions) }));
  const allMinutes = [
    ...columns.flatMap((c) => c.work.flat()),
    ...appointments.flatMap((a) => [toMinutesOfDay(a.startAt), toMinutesOfDay(a.endAt) || 24 * 60]),
  ];
  const start = Math.min(8 * 60, ...allMinutes.map((m) => Math.floor(m / 60) * 60));
  const end = Math.max(20 * 60, ...allMinutes.map((m) => Math.ceil(m / 60) * 60));
  const height = (end - start) * PX_PER_MIN;
  const hours = Array.from({ length: (end - start) / 60 + 1 }, (_, i) => start + i * 60);

  return (
    <div className="overflow-x-auto rounded-2xl border bg-card">
      <div className="flex min-w-max">
        {/* Шкала времени */}
        <div className="sticky left-0 z-10 w-14 shrink-0 border-r bg-card">
          <div className="h-12 border-b" />
          <div className="relative" style={{ height }}>
            {hours.map((h) => (
              <span key={h} className="absolute right-2 -translate-y-1/2 text-xs text-muted-foreground tabular-nums" style={{ top: (h - start) * PX_PER_MIN }}>
                {minutesToHHMM(h)}
              </span>
            ))}
          </div>
        </div>

        {columns.map((col) => {
          const items = appointments.filter((a) => a.doctorId === col.id);
          return (
            <div key={col.id} className="w-52 shrink-0 border-r last:border-r-0 sm:w-60">
              <div className="flex h-12 items-center border-b px-3">
                <p className="truncate text-sm font-semibold text-ink">{col.name}</p>
              </div>
              <div
                className="relative bg-[repeating-linear-gradient(135deg,var(--muted)_0_6px,transparent_6px_12px)]"
                style={{ height }}
              >
                {col.work.map(([s, e]) => (
                  <div key={s} className="absolute inset-x-0 bg-card" style={{ top: (s - start) * PX_PER_MIN, height: (e - s) * PX_PER_MIN }} />
                ))}
                {hours.map((h) => (
                  <div key={h} className="absolute inset-x-0 border-t border-border/60" style={{ top: (h - start) * PX_PER_MIN }} />
                ))}
                {items.map((a) => {
                  const s = toMinutesOfDay(a.startAt);
                  const e = toMinutesOfDay(a.endAt) || 24 * 60;
                  const meta = isStatus(a.status) ? STATUS_META[a.status] : null;
                  const inactive = a.status === "CANCELLED" || a.status === "NO_SHOW";
                  return (
                    <Link
                      key={a.id}
                      href={`/admin/appointments/${a.id}`}
                      className={cn(
                        "absolute inset-x-1.5 overflow-hidden rounded-xl border-l-4 px-2.5 py-1.5 text-xs shadow-soft transition-transform hover:z-10 hover:scale-[1.02]",
                        inactive ? "border-muted-foreground/40 bg-muted/90 opacity-70" : "border-primary bg-primary-soft",
                      )}
                      style={{ top: (s - start) * PX_PER_MIN + 1, height: Math.max((e - s) * PX_PER_MIN - 2, 26) }}
                    >
                      <span className="flex items-center gap-1.5 font-semibold text-ink tabular-nums">
                        <span className={cn("size-1.5 rounded-full", meta?.dot)} aria-hidden />
                        {formatTime(a.startAt)}–{formatTime(a.endAt)}
                      </span>
                      <span className="block truncate font-medium text-ink">{a.patientName}</span>
                      <span className="block truncate text-muted-foreground">{tr(a.service.name, "ru")}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
