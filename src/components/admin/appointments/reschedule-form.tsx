"use client";

import { CalendarClock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { rescheduleAppointmentAction } from "@/app/admin/(panel)/appointments/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateLong, formatTime } from "@/lib/time";
import { cn } from "@/lib/utils";

type Slot = { start: string };

/** Перенос записи: дата → врач → свободное время. Текущее время записи считается свободным. */
export function RescheduleForm({
  appointmentId,
  serviceId,
  doctors,
  currentDoctorId,
  currentDate,
  currentStart,
  today,
}: {
  appointmentId: string;
  serviceId: string;
  doctors: { id: string; name: string }[];
  currentDoctorId: string;
  currentDate: string;
  currentStart: string;
  today: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [doctorId, setDoctorId] = useState(currentDoctorId);
  const [date, setDate] = useState(currentDate);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [start, setStart] = useState("");
  const [reload, setReload] = useState(0);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open || !date) return;
    const controller = new AbortController();
    fetch(`/api/admin/slots?service=${serviceId}&doctor=${doctorId}&date=${date}&exclude=${appointmentId}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((d: { slots?: Slot[] }) => {
        setSlots(d.slots ?? []);
        setStart("");
      })
      .catch(() => {});
    return () => controller.abort();
  }, [open, serviceId, doctorId, date, appointmentId, reload]);

  function submit() {
    if (!start) return;
    startTransition(async () => {
      const res = await rescheduleAppointmentAction(appointmentId, { start, doctorId });
      if (res.ok) {
        toast.success(`Перенесено: ${formatDateLong(new Date(start), "ru")}, ${formatTime(new Date(start))}`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(res.error);
        setReload((n) => n + 1); // время могли занять — обновляем список слотов
      }
    });
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <CalendarClock /> Перенести
      </Button>
    );
  }

  const label = "mb-1.5 block text-sm font-semibold text-ink";

  return (
    <section aria-labelledby="reschedule-title" className="w-full rounded-2xl border bg-surface p-4 sm:p-5">
      <h2 id="reschedule-title" className="mb-4 text-lg font-bold">
        Перенос записи
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="rs-date" className={label}>
            Новая дата
          </label>
          <Input id="rs-date" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <span className={label}>Врач</span>
          <Select value={doctorId} onValueChange={setDoctorId}>
            <SelectTrigger aria-label="Врач" className="h-11 w-full rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-4">
        <span className={label}>Свободное время</span>
        {slots === null ? (
          <p className="text-sm text-muted-foreground">Загрузка…</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-muted-foreground">На эту дату у врача нет свободного времени</p>
        ) : (
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
            {slots.map((s) => {
              const isCurrent = s.start === currentStart && doctorId === currentDoctorId;
              return (
                <button
                  key={s.start}
                  type="button"
                  disabled={isCurrent}
                  aria-pressed={start === s.start}
                  onClick={() => setStart(s.start)}
                  title={isCurrent ? "Текущее время записи" : undefined}
                  className={cn(
                    "h-10 rounded-xl border text-sm font-semibold tabular-nums transition-colors hover:border-primary disabled:cursor-default disabled:border-dashed disabled:text-muted-foreground disabled:hover:border-border",
                    start === s.start ? "border-primary bg-primary text-primary-foreground" : "bg-card text-ink",
                  )}
                >
                  {formatTime(new Date(s.start))}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="button" onClick={submit} disabled={!start || pending}>
          {pending && <Loader2 className="animate-spin" />} Перенести
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
          Отмена
        </Button>
      </div>
    </section>
  );
}
