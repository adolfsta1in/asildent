"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addException, deleteException } from "@/app/admin/(panel)/doctors/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateLong, hhmmToMinutes, minutesToHHMM } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Field, Section } from "../form-ui";

type Exception = { id: string; date: string; type: string; startMin: number | null; endMin: number | null; note: string | null };

export function ExceptionsEditor({ doctorId, exceptions, today }: { doctorId: string; exceptions: Exception[]; today: string }) {
  const [type, setType] = useState<"DAY_OFF" | "CUSTOM_HOURS">("DAY_OFF");
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState("");
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("15:00");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  function add() {
    startTransition(async () => {
      const res = await addException(doctorId, {
        from,
        to: type === "DAY_OFF" ? to : "",
        type,
        startMin: type === "CUSTOM_HOURS" ? hhmmToMinutes(start) : null,
        endMin: type === "CUSTOM_HOURS" ? hhmmToMinutes(end) : null,
        note,
      });
      if (res.ok) {
        toast.success(res.message);
        setNote("");
        setTo("");
      } else toast.error(res.message);
    });
  }

  const sorted = [...exceptions].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Section title="Исключения" description="Отпуск, больничный, выходной в будний день или особые часы на конкретную дату.">
      <div className="space-y-4 rounded-2xl border bg-surface/50 p-4">
        <div role="radiogroup" aria-label="Тип исключения" className="inline-flex rounded-full bg-card p-1">
          {(
            [
              ["DAY_OFF", "Выходной / отпуск"],
              ["CUSTOM_HOURS", "Особые часы"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={type === value}
              onClick={() => setType(value)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium",
                type === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label={type === "DAY_OFF" ? "С даты" : "Дата"} htmlFor="ex-from">
            <Input id="ex-from" type="date" min={today} value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          {type === "DAY_OFF" ? (
            <Field label="По дату (включительно)" htmlFor="ex-to" hint="Пусто — один день">
              <Input id="ex-to" type="date" min={from} value={to} onChange={(e) => setTo(e.target.value)} />
            </Field>
          ) : (
            <Field label="Часы работы" htmlFor="ex-start">
              <div className="flex items-center gap-2">
                <Input id="ex-start" type="time" step={300} value={start} onChange={(e) => setStart(e.target.value)} />
                <span>—</span>
                <Input type="time" step={300} value={end} onChange={(e) => setEnd(e.target.value)} aria-label="Конец" />
              </div>
            </Field>
          )}
          <Field label="Пометка" htmlFor="ex-note" className="sm:col-span-2 lg:col-span-1">
            <Input id="ex-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Отпуск, конференция…" />
          </Field>
          <div className="flex items-end">
            <Button onClick={add} disabled={pending} className="h-11 w-full">
              {pending && <Loader2 className="animate-spin" />} Добавить
            </Button>
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">Исключений нет — врач работает по недельному графику.</p>
      ) : (
        <ul className="divide-y rounded-2xl border">
          {sorted.map((e) => (
            <li key={e.id} className="flex items-center gap-3 px-4 py-3">
              <span className={cn("size-2 shrink-0 rounded-full", e.type === "DAY_OFF" ? "bg-destructive" : "bg-warning")} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink first-letter:uppercase">{formatDateLong(e.date, "ru")}</p>
                <p className="text-xs text-muted-foreground">
                  {e.type === "DAY_OFF" ? "Не работает" : `Работает ${minutesToHHMM(e.startMin ?? 0)}–${minutesToHHMM(e.endMin ?? 0)}`}
                  {e.note ? ` · ${e.note}` : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Удалить исключение"
                onClick={() =>
                  startTransition(async () => {
                    const res = await deleteException(e.id);
                    if (res.ok) toast.success(res.message);
                  })
                }
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
