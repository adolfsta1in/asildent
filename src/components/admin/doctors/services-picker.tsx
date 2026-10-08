"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveDoctorServices } from "@/app/admin/(panel)/doctors/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Section } from "../form-ui";

type Group = { category: string; services: { id: string; name: string; durationMin: number }[] };

export function ServicesPicker({ doctorId, groups, selected }: { doctorId: string; groups: Group[]; selected: string[] }) {
  const [ids, setIds] = useState(new Set(selected));
  const [pending, startTransition] = useTransition();

  function toggle(id: string, on: boolean) {
    setIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <Section title="Услуги врача" description="На эти услуги к врачу можно записаться онлайн.">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {groups.map((g) => (
          <fieldset key={g.category}>
            <legend className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">{g.category}</legend>
            <ul className="space-y-1">
              {g.services.map((s) => (
                <li key={s.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted">
                    <Checkbox checked={ids.has(s.id)} onCheckedChange={(v) => toggle(s.id, v === true)} />
                    <span className="flex-1 text-sm">{s.name}</span>
                    <span className="text-xs text-muted-foreground">{s.durationMin} мин</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        ))}
      </div>
      <div className="flex justify-end">
        <Button
          size="lg"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await saveDoctorServices(doctorId, [...ids]);
              if (res.ok) toast.success(res.message);
              else toast.error(res.message);
            })
          }
        >
          {pending && <Loader2 className="animate-spin" />} Сохранить услуги
        </Button>
      </div>
    </Section>
  );
}
