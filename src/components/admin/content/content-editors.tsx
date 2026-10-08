"use client";

import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import { deleteFaq, deleteReview, moveFaq, moveReview, saveFaq, saveReview } from "@/app/admin/(panel)/content/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LocalizedText } from "@/config/clinic";
import type { FormState } from "@/lib/admin/form";
import { cn } from "@/lib/utils";
import { Field, LocalizedInput, SubmitButton, SwitchField, useFormToast } from "../form-ui";
import { SortButtons } from "../sort-buttons";

export type ReviewItem = {
  id: string;
  authorName: string;
  text: LocalizedText;
  serviceName: LocalizedText | null;
  rating: number;
  isPublished: boolean;
  isDemo: boolean;
};
export type FaqItem = { id: string; question: LocalizedText; answer: LocalizedText };

function Collapsible({ title, subtitle, children, defaultOpen = false, aside }: { title: string; subtitle?: string; children: React.ReactNode; defaultOpen?: boolean; aside?: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border bg-card">
      <div className="flex items-center gap-2 p-2 pr-3">
        {aside}
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2 text-left hover:bg-muted">
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-ink">{title}</span>
            {subtitle && <span className="block truncate text-sm text-muted-foreground">{subtitle}</span>}
          </span>
          <ChevronDown className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")} aria-hidden />
        </button>
      </div>
      {open && <div className="border-t p-4 sm:p-5">{children}</div>}
    </div>
  );
}

function ReviewForm({ review, onDone }: { review?: ReviewItem; onDone?: () => void }) {
  const [state, action] = useActionState<FormState, FormData>(async (p, fd) => {
    const res = await saveReview(p, fd);
    if (res.ok) onDone?.();
    return res;
  }, {});
  useFormToast(state);
  const [pending, startTransition] = useTransition();
  return (
    <form action={action} className="space-y-4">
      {review && <input type="hidden" name="id" value={review.id} />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_8rem]">
        <Field label="Автор" htmlFor={`a-${review?.id ?? "new"}`}>
          <Input id={`a-${review?.id ?? "new"}`} name="authorName" defaultValue={review?.authorName} required placeholder="Айжан К." />
        </Field>
        <Field label="Оценка" htmlFor={`r-${review?.id ?? "new"}`}>
          <Input id={`r-${review?.id ?? "new"}`} name="rating" type="number" min={1} max={5} defaultValue={review?.rating ?? 5} />
        </Field>
      </div>
      <LocalizedInput name="text" label="Текст отзыва" defaultValue={review?.text} multiline rows={4} required />
      <LocalizedInput name="serviceName" label="Услуга (подпись)" defaultValue={review?.serviceName ?? undefined} />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <SwitchField name="isPublished" label="Опубликован" defaultChecked={review?.isPublished ?? true} />
        <SwitchField name="isDemo" label="Пометка «Демо»" defaultChecked={review?.isDemo ?? false} hint="Выключите для настоящих отзывов" />
      </div>
      <div className="flex justify-between gap-2">
        {review ? (
          <Button type="button" variant="destructive" disabled={pending} onClick={() => confirm("Удалить отзыв?") && startTransition(() => deleteReview(review.id))}>
            <Trash2 /> Удалить
          </Button>
        ) : (
          <span />
        )}
        <SubmitButton>{review ? "Сохранить" : "Добавить отзыв"}</SubmitButton>
      </div>
    </form>
  );
}

function FaqForm({ faq, onDone }: { faq?: FaqItem; onDone?: () => void }) {
  const [state, action] = useActionState<FormState, FormData>(async (p, fd) => {
    const res = await saveFaq(p, fd);
    if (res.ok) onDone?.();
    return res;
  }, {});
  useFormToast(state);
  const [pending, startTransition] = useTransition();
  return (
    <form action={action} className="space-y-4">
      {faq && <input type="hidden" name="id" value={faq.id} />}
      <LocalizedInput name="question" label="Вопрос" defaultValue={faq?.question} required />
      <LocalizedInput name="answer" label="Ответ" defaultValue={faq?.answer} multiline rows={3} required />
      <div className="flex justify-between gap-2">
        {faq ? (
          <Button type="button" variant="destructive" disabled={pending} onClick={() => confirm("Удалить вопрос?") && startTransition(() => deleteFaq(faq.id))}>
            <Trash2 /> Удалить
          </Button>
        ) : (
          <span />
        )}
        <SubmitButton>{faq ? "Сохранить" : "Добавить вопрос"}</SubmitButton>
      </div>
    </form>
  );
}

export function ReviewsEditor({ reviews }: { reviews: ReviewItem[] }) {
  const [adding, setAdding] = useState(false);
  return (
    <section aria-labelledby="reviews-h" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 id="reviews-h" className="text-lg font-bold">
          Отзывы
        </h2>
        <Button variant="outline" size="sm" onClick={() => setAdding((a) => !a)}>
          <Plus /> Добавить
        </Button>
      </div>
      {adding && (
        <div className="rounded-2xl border bg-card p-4 sm:p-5">
          <ReviewForm onDone={() => setAdding(false)} />
        </div>
      )}
      {reviews.map((r, i) => (
        <Collapsible
          key={r.id}
          title={r.authorName}
          subtitle={`${"★".repeat(r.rating)} · ${r.text.ru.slice(0, 70)}…${r.isPublished ? "" : " · скрыт"}${r.isDemo ? " · демо" : ""}`}
          aside={<SortButtons onMove={(d) => moveReview(r.id, d)} first={i === 0} last={i === reviews.length - 1} label={r.authorName} />}
        >
          <ReviewForm review={r} />
        </Collapsible>
      ))}
    </section>
  );
}

export function FaqEditor({ faqs }: { faqs: FaqItem[] }) {
  const [adding, setAdding] = useState(false);
  return (
    <section aria-labelledby="faq-h" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 id="faq-h" className="text-lg font-bold">
          Частые вопросы
        </h2>
        <Button variant="outline" size="sm" onClick={() => setAdding((a) => !a)}>
          <Plus /> Добавить
        </Button>
      </div>
      {adding && (
        <div className="rounded-2xl border bg-card p-4 sm:p-5">
          <FaqForm onDone={() => setAdding(false)} />
        </div>
      )}
      {faqs.map((f, i) => (
        <Collapsible
          key={f.id}
          title={f.question.ru}
          subtitle={f.answer.ru}
          aside={<SortButtons onMove={(d) => moveFaq(f.id, d)} first={i === 0} last={i === faqs.length - 1} label={f.question.ru} />}
        >
          <FaqForm faq={f} />
        </Collapsible>
      ))}
    </section>
  );
}

