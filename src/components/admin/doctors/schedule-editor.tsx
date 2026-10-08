"use client";

import { Copy, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveSchedule } from "@/app/admin/(panel)/doctors/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { hhmmToMinutes, minutesToHHMM } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Section } from "../form-ui";

type Rule = { weekday: number; startMin: number; endMin: number; breakStartMin: number | null; breakEndMin: number | null };
type DayState = { on: boolean; start: string; end: string; hasBreak: boolean; breakStart: string; breakEnd: string };

const DAYS = [
  { wd: 1, label: "Понедельник" },
  { wd: 2, label: "Вторник" },
  { wd: 3, label: "Среда" },
  { wd: 4, label: "Четверг" },
  { wd: 5, label: "Пятница" },
  { wd: 6, label: "Суббота" },
  { wd: 0, label: "Воскресенье" },
];

function toState(rules: Rule[]): Record<number, DayState> {
  const out: Record<number, DayState> = {};
  for (const { wd } of DAYS) {
    const r = rules.find((x) => x.weekday === wd);
    out[wd] = r
      ? {
          on: true,
          start: minutesToHHMM(r.startMin),
          end: minutesToHHMM(r.endMin),
          hasBreak: r.breakStartMin !== null,
          breakStart: r.breakStartMin !== null ? minutesToHHMM(r.breakStartMin) : "13:00",
          breakEnd: r.breakEndMin !== null ? minutesToHHMM(r.breakEndMin) : "14:00",
        }
      : { on: false, start: "09:00", end: "18:00", hasBreak: true, breakStart: "13:00", breakEnd: "14:00" };
  }
  return out;
}

export function ScheduleEditor({ doctorId, rules }: { doctorId: string; rules: Rule[] }) {
  const [days, setDays] = useState(() => toState(rules));
  const [pending, startTransition] = useTransition();

  const set = (wd: number, patch: Partial<DayState>) => setDays((d) => ({ ...d, [wd]: { ...d[wd], ...patch } }));

  function copyMondayToWeekdays() {
    setDays((d) => ({ ...d, 2: { ...d[1] }, 3: { ...d[1] }, 4: { ...d[1] }, 5: { ...d[1] } }));
  }

  function save() {
    const payload: Rule[] = DAYS.filter(({ wd }) => days[wd].on).map(({ wd }) => {
      const d = days[wd];
      return {
        weekday: wd,
        startMin: hhmmToMinutes(d.start),
        endMin: d.end === "00:00" ? 1440 : hhmmToMinutes(d.end),
        breakStartMin: d.hasBreak ? hhmmToMinutes(d.breakStart) : null,
        breakEndMin: d.hasBreak ? hhmmToMinutes(d.breakEnd) : null,
      };
    });
    startTransition(async () => {
      const res = await saveSchedule(doctorId, payload);
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
    });
  }

  return (
    <Section title="Недельный график" description="Повторяется каждую неделю. Отпуска и особые дни — в блоке «Исключения».">
      <ul className="divide-y rounded-2xl border">
        {DAYS.map(({ wd, label }) => {
          const d = days[wd];
          return (
            <li key={wd} className={cn("grid gap-3 p-3 sm:grid-cols-[11rem_1fr] sm:items-center sm:p-4", !d.on && "bg-muted/40")}>
              <label className="flex items-center gap-3">
                <Switch checked={d.on} onCheckedChange={(on) => set(wd, { on })} aria-label={`${label}: рабочий день`} />
                <span className={cn("text-sm font-semibold", d.on ? "text-ink" : "text-muted-foreground")}>{label}</span>
              </label>
              {d.on ? (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Input type="time" step={300} value={d.start} onChange={(e) => set(wd, { start: e.target.value })} aria-label={`${label}: начало`} className="h-9 w-28" />
                  <span>—</span>
                  <Input type="time" step={300} value={d.end} onChange={(e) => set(wd, { end: e.target.value })} aria-label={`${label}: конец`} className="h-9 w-28" />
                  <label className="ml-1 flex items-center gap-2 text-muted-foreground sm:ml-3">
                    <input type="checkbox" checked={d.hasBreak} onChange={(e) => set(wd, { hasBreak: e.target.checked })} className="size-4 accent-[var(--primary)]" />
                    перерыв
                  </label>
                  {d.hasBreak && (
                    <>
                      <Input type="time" step={300} value={d.breakStart} onChange={(e) => set(wd, { breakStart: e.target.value })} aria-label={`${label}: начало перерыва`} className="h-9 w-28" />
                      <span>—</span>
                      <Input type="time" step={300} value={d.breakEnd} onChange={(e) => set(wd, { breakEnd: e.target.value })} aria-label={`${label}: конец перерыва`} className="h-9 w-28" />
                    </>
                  )}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Выходной</span>
              )}
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap justify-between gap-2">
        <Button type="button" variant="outline" onClick={copyMondayToWeekdays}>
          <Copy /> Как в понедельник — на Вт–Пт
        </Button>
        <Button size="lg" onClick={save} disabled={pending}>
          {pending && <Loader2 className="animate-spin" />} Сохранить график
        </Button>
      </div>
    </Section>
  );
}
