"use client";

import { Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { useActionState, useState, useTransition } from "react";
import {
  addCertificate,
  deleteCertificate,
  moveCertificate,
  updateCertificate,
} from "@/app/admin/(panel)/doctors/actions";
import { Button } from "@/components/ui/button";
import type { LocalizedText } from "@/config/clinic";
import type { FormState } from "@/lib/admin/form";
import { Field, LocalizedInput, Section, SubmitButton, useFormToast } from "../form-ui";
import { ImageInput } from "../image-input";
import { SortButtons } from "../sort-buttons";

export type CertificateItem = { id: string; imageUrl: string; title: LocalizedText };

/** Сертификаты и дипломы врача: загрузка, подписи, порядок. На сайте — галерея на странице врача. */
export function CertificatesEditor({ doctorId, items }: { doctorId: string; items: CertificateItem[] }) {
  return (
    <>
      <Section
        title="Добавить сертификат"
        description="Фото или скан диплома, сертификата, курса. Пациенты увидят их на странице врача и смогут открыть крупно."
      >
        <AddForm doctorId={doctorId} />
      </Section>

      <Section title={`Сертификаты на сайте${items.length ? ` · ${items.length}` : ""}`}>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Пока нет сертификатов — блок на странице врача скрыт.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((c, i) => (
              <CertificateCard key={c.id} item={c} first={i === 0} last={i === items.length - 1} />
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}

function AddForm({ doctorId }: { doctorId: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [state, action] = useActionState<FormState, FormData>(async (p, fd) => {
    const res = await addCertificate(doctorId, p, fd);
    if (res.ok) setPreview(null);
    return res;
  }, {});
  useFormToast(state);

  return (
    <form action={action} className="grid grid-cols-1 gap-4 md:grid-cols-[10rem_1fr]">
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border bg-muted text-xs text-muted-foreground">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- превью локального файла (blob:)
          <img src={preview} alt="" className="size-full object-contain" />
        ) : (
          "Превью"
        )}
      </div>
      <div className="space-y-4">
        <Field label="Фото сертификата" htmlFor="cert-image" error={state.errors?.image} hint="Фото с телефона подойдёт — сожмётся автоматически">
          <ImageInput id="cert-image" name="image" required onPreview={setPreview} maxSide={2400} />
        </Field>
        <LocalizedInput name="title" label="Подпись" hint="Например: «Курс по эндодонтии, Алматы, 2024». Можно оставить пустой" />
        <div className="flex justify-end">
          <SubmitButton>Добавить сертификат</SubmitButton>
        </div>
      </div>
    </form>
  );
}

function CertificateCard({ item, first, last }: { item: CertificateItem; first: boolean; last: boolean }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [state, action] = useActionState<FormState, FormData>(async (p, fd) => {
    const res = await updateCertificate(item.id, p, fd);
    if (res.ok) setEditing(false);
    return res;
  }, {});
  useFormToast(state);
  const label = item.title.ru || "Сертификат";

  return (
    <li className="overflow-hidden rounded-2xl border bg-card">
      <div className="relative aspect-[4/3] bg-muted">
        <Image src={item.imageUrl} alt={label} fill sizes="(min-width: 1280px) 20vw, (min-width: 640px) 40vw, 90vw" className="object-contain" />
      </div>
      <div className="flex items-start gap-2 p-3">
        <SortButtons onMove={(d) => moveCertificate(item.id, d)} first={first} last={last} label={label} />
        <p className="min-w-0 flex-1 pt-1 text-sm leading-snug">{item.title.ru || <span className="text-muted-foreground">Без подписи</span>}</p>
        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Изменить подпись: ${label}`} onClick={() => setEditing((e) => !e)}>
          <Pencil />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Удалить: ${label}`}
          disabled={pending}
          onClick={() => confirm("Удалить сертификат?") && startTransition(() => deleteCertificate(item.id))}
        >
          <Trash2 />
        </Button>
      </div>
      {editing && (
        <form action={action} className="space-y-3 border-t p-3">
          <LocalizedInput name="title" label="Подпись" defaultValue={item.title} />
          <div className="flex justify-end">
            <SubmitButton className="min-w-0">Сохранить</SubmitButton>
          </div>
        </form>
      )}
    </li>
  );
}
