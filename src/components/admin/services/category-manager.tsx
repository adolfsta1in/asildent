"use client";

import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteCategory, saveCategory } from "@/app/admin/(panel)/services/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LocalizedText } from "@/config/clinic";
import type { FormState } from "@/lib/admin/form";
import { Section, useFormToast } from "../form-ui";
import { CategorySort } from "./service-sort";

type Category = { id: string; name: LocalizedText; count: number };

function CategoryRow({ c, first, last }: { c: Category; first: boolean; last: boolean }) {
  const [editing, setEditing] = useState(false);
  const [state, action] = useActionState<FormState, FormData>(async (prev, fd) => {
    const res = await saveCategory(prev, fd);
    if (res.ok) setEditing(false);
    return res;
  }, {});
  useFormToast(state);
  const [pending, startTransition] = useTransition();

  return (
    <li className="flex items-center gap-2 px-2 py-2 sm:px-3">
      <CategorySort id={c.id} first={first} last={last} label={c.name.ru} />
      {editing ? (
        <form action={action} className="grid flex-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input type="hidden" name="id" value={c.id} />
          <Input name="name.ru" defaultValue={c.name.ru} aria-label="Название (русский)" required className="h-9" />
          <Input name="name.ky" defaultValue={c.name.ky} aria-label="Название (кыргызский)" placeholder="KG" className="h-9" />
          <Button type="submit" size="icon" aria-label="Сохранить">
            <Check />
          </Button>
        </form>
      ) : (
        <>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{c.name.ru}</p>
            <p className="truncate text-xs text-muted-foreground">
              {c.name.ky || "— нет перевода"} · услуг: {c.count}
            </p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => setEditing(true)} aria-label={`Переименовать ${c.name.ru}`}>
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={pending}
            aria-label={`Удалить ${c.name.ru}`}
            onClick={() =>
              startTransition(async () => {
                const res = await deleteCategory(c.id);
                if (res.ok) toast.success(res.message);
                else toast.error(res.message);
              })
            }
          >
            <Trash2 />
          </Button>
        </>
      )}
    </li>
  );
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [state, action] = useActionState<FormState, FormData>(saveCategory, {});
  useFormToast(state);
  return (
    <Section title="Категории" description="Порядок категорий — как на странице «Услуги и цены».">
      <ul className="divide-y rounded-2xl border">
        {categories.map((c, i) => (
          <CategoryRow key={c.id} c={c} first={i === 0} last={i === categories.length - 1} />
        ))}
      </ul>
      <form action={action} key={categories.length} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <Input name="name.ru" placeholder="Новая категория (RU)" aria-label="Новая категория (русский)" required />
        <Input name="name.ky" placeholder="KG" aria-label="Новая категория (кыргызский)" />
        <Button type="submit" variant="outline" className="h-11">
          <Plus /> Добавить
        </Button>
      </form>
    </Section>
  );
}
