"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { setAppointmentStatus } from "@/app/admin/(panel)/appointments/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUSES, STATUS_META, isStatus } from "@/lib/appointment-status";
import { cn } from "@/lib/utils";

/** Смена статуса прямо в списке: оптимистично, с откатом и сообщением при ошибке. */
export function StatusSelect({ id, status, className }: { id: string; status: string; className?: string }) {
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(status);
  const meta = isStatus(optimistic) ? STATUS_META[optimistic] : null;

  return (
    <Select
      value={optimistic}
      onValueChange={(next) =>
        startTransition(async () => {
          setOptimistic(next);
          const res = await setAppointmentStatus(id, next);
          if (res.ok) toast.success(`Статус: ${STATUS_META[next as keyof typeof STATUS_META].label}`);
          else toast.error(res.error);
        })
      }
      disabled={pending}
    >
      <SelectTrigger
        aria-label="Статус записи"
        className={cn("h-8 w-[10.5rem] rounded-full border-0 px-3 text-xs font-semibold shadow-none", meta?.className, className)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            <span className={cn("size-2 rounded-full", STATUS_META[s].dot)} aria-hidden />
            {STATUS_META[s].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
