"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useId, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { LocalizedText } from "@/config/clinic";
import type { FormState } from "@/lib/admin/form";
import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  className,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
    </div>
  );
}

/** Двуязычное поле: русский (обязательный) и кыргызский (если пусто — на сайте показывается русский). */
export function LocalizedInput({
  name,
  label,
  defaultValue,
  multiline = false,
  rows = 3,
  required = false,
  hint,
  error,
}: {
  name: string;
  label: string;
  defaultValue?: LocalizedText;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  hint?: string;
  error?: string;
}) {
  const id = useId();
  const Comp = multiline ? Textarea : Input;
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold text-ink">{label}</legend>
      <div className="grid gap-2 md:grid-cols-2">
        {(["ru", "ky"] as const).map((lang) => (
          <div key={lang} className="relative">
            <label htmlFor={`${id}-${lang}`} className="sr-only">
              {label} ({lang === "ru" ? "русский" : "кыргызский"})
            </label>
            <span className="pointer-events-none absolute top-2.5 right-3 z-10 rounded bg-muted px-1.5 py-0.5 text-[0.65rem] font-bold text-muted-foreground">
              {lang === "ru" ? "RU" : "KG"}
            </span>
            <Comp
              id={`${id}-${lang}`}
              name={`${name}.${lang}`}
              defaultValue={defaultValue?.[lang] ?? ""}
              required={required && lang === "ru"}
              lang={lang}
              {...(multiline ? { rows } : {})}
              className="pr-12"
            />
          </div>
        ))}
      </div>
      {hint && !error && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
    </fieldset>
  );
}

export function SwitchField({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border p-4">
      <div>
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <Switch id={id} name={name} defaultChecked={defaultChecked} value="on" />
    </div>
  );
}

export function SubmitButton({ children, className }: { children: ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className={cn("min-w-40", className)}>
      {pending && <Loader2 className="animate-spin" />}
      {children}
    </Button>
  );
}

/** Показывает toast по результату server action. */
export function useFormToast(state: FormState) {
  useEffect(() => {
    if (state.ok) toast.success(state.message ?? "Сохранено");
    else if (state.message) toast.error(state.message);
  }, [state]);
}

export function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border bg-card p-5 sm:p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}
