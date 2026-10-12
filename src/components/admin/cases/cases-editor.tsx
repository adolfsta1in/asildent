"use client";

import { ChevronDown, EyeOff, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useActionState, useState, useTransition } from "react";
import { deleteCase, moveCase, saveCase } from "@/app/admin/(panel)/cases/actions";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { LocalizedText } from "@/config/clinic";
import type { FormState } from "@/lib/admin/form";
import { cn } from "@/lib/utils";
import { Field, LocalizedInput, SubmitButton, SwitchField, useFormToast } from "../form-ui";
import { ImageInput } from "../image-input";
import { SortButtons } from "../sort-buttons";

export type CaseItem = {
  id: string;
  beforeUrl: string;
  afterUrl: string;
  title: LocalizedText;
  description: LocalizedText;
  doctorId: string | null;
  isPublished: boolean;
};
type DoctorOption = { id: string; name: string };

export function CasesEditor({ cases, doctors }: { cases: CaseItem[]; doctors: DoctorOption[] }) {
  const [adding, setAdding] = useState(cases.length === 0);
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setAdding((a) => !a)}>
          <Plus /> Новый кейс
        </Button>
      </div>
      {adding && (
        <div className="rounded-3xl border bg-card p-5 sm:p-6">
          <h2 className="mb-5 text-lg font-bold">Новый кейс</h2>
          <CaseForm doctors={doctors} onDone={() => setAdding(false)} />
        </div>
      )}
      {cases.map((c, i) => (
        <CaseRow key={c.id} item={c} doctors={doctors} first={i === 0} last={i === cases.length - 1} />
      ))}
    </div>
  );
}

function CaseRow({ item, doctors, first, last }: { item: CaseItem; doctors: DoctorOption[]; first: boolean; last: boolean }) {
  const [open, setOpen] = useState(false);
  const doctor = doctors.find((d) => d.id === item.doctorId);
  return (
    <div className="rounded-3xl border bg-card">
      <div className="flex items-center gap-2 p-2 pr-3">
        <SortButtons onMove={(d) => moveCase(item.id, d)} first={first} last={last} label={item.title.ru} />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-2 text-left hover:bg-muted"
        >
          <span className="flex shrink-0 gap-1">
            <Thumb src={item.beforeUrl} />
            <Thumb src={item.afterUrl} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 font-semibold text-ink">
              <span className="truncate">{item.title.ru}</span>
              {!item.isPublished && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  <EyeOff className="size-3" /> скрыт
                </span>
              )}
            </span>
            <span className="block truncate text-sm text-muted-foreground">
              {[doctor?.name, item.description.ru].filter(Boolean).join(" · ") || "Без описания"}
            </span>
          </span>
          <ChevronDown className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")} aria-hidden />
        </button>
      </div>
      {open && (
        <div className="border-t p-4 sm:p-6">
          <CaseForm item={item} doctors={doctors} onDone={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

function Thumb({ src }: { src: string }) {
  return (
    <span className="relative block size-12 overflow-hidden rounded-xl bg-muted sm:size-14">
      <Image src={src} alt="" fill sizes="56px" className="object-cover" />
    </span>
  );
}

function CaseForm({ item, doctors, onDone }: { item?: CaseItem; doctors: DoctorOption[]; onDone?: () => void }) {
  const [before, setBefore] = useState<string | null>(item?.beforeUrl ?? null);
  const [after, setAfter] = useState<string | null>(item?.afterUrl ?? null);
  const [state, action] = useActionState<FormState, FormData>(async (p, fd) => {
    const res = await saveCase(p, fd);
    if (res.ok) {
      if (!item) {
        setBefore(null);
        setAfter(null);
      }
      onDone?.();
    }
    return res;
  }, {});
  useFormToast(state);
  const [pending, startTransition] = useTransition();
  const e = state.errors ?? {};
  const key = item?.id ?? "new";

  return (
    <form action={action} className="space-y-5">
      {item && <input type="hidden" name="id" value={item.id} />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(
          [
            ["before", "До", before, setBefore],
            ["after", "После", after, setAfter],
          ] as const
        ).map(([name, label, preview, setPreview]) => (
          <div key={name} className="space-y-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-muted">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element -- превью: blob: или уже загруженное фото
                <img src={preview} alt="" className="size-full object-cover" />
              ) : (
                <span className="flex size-full items-center justify-center text-sm text-muted-foreground">Фото «{label.toLowerCase()}»</span>
              )}
              <span
                className={cn(
                  "absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold",
                  name === "before" ? "bg-ink/80 text-white" : "bg-primary text-primary-foreground",
                )}
              >
                {label}
              </span>
            </div>
            <Field
              label={item ? `Заменить фото «${label.toLowerCase()}»` : `Фото «${label.toLowerCase()}»`}
              htmlFor={`${name}-${key}`}
              error={e[name]}
            >
              <ImageInput
                id={`${name}-${key}`}
                name={name}
                required={!item}
                onPreview={(url) => setPreview(url ?? (name === "before" ? item?.beforeUrl : item?.afterUrl) ?? null)}
              />
            </Field>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Снимайте «до» и «после» с одного ракурса и при одном свете — так слайдер на сайте выглядит лучше. Нужно согласие пациента на публикацию.
      </p>

      <LocalizedInput name="title" label="Название" defaultValue={item?.title} required error={e.title} hint="Например: «Виниры на 6 передних зубов»" />
      <LocalizedInput
        name="description"
        label="Описание"
        defaultValue={item?.description}
        multiline
        rows={3}
        hint="Что было, что сделали и за какой срок. Можно оставить пустым"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Врач" htmlFor={`doctor-${key}`} error={e.doctorId} hint="Подпись под кейсом со ссылкой на врача">
          <Select name="doctorId" defaultValue={item?.doctorId ?? "none"}>
            <SelectTrigger id={`doctor-${key}`} className="h-11 w-full rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Не указывать</SelectItem>
              {doctors.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <SwitchField name="isPublished" label="Показывать на сайте" defaultChecked={item?.isPublished ?? true} />
      </div>

      <div className="flex justify-between gap-2">
        {item ? (
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={() => confirm("Удалить кейс вместе с фото?") && startTransition(() => deleteCase(item.id))}
          >
            <Trash2 /> Удалить
          </Button>
        ) : (
          <span />
        )}
        <SubmitButton>{item ? "Сохранить" : "Добавить кейс"}</SubmitButton>
      </div>
    </form>
  );
}
