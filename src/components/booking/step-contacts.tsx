"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { IMaskInput } from "react-imask";
import { toast } from "sonner";
import { submitBooking } from "@/app/[locale]/booking/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";
import type { Alternative, BookingConfirmation } from "@/lib/booking/create";
import { formatDateLong, formatTime, toDateKey, type DateKey } from "@/lib/time";
import type { ContactValues } from "@/lib/validators/booking";
import { cn } from "@/lib/utils";
import type { WizardDoctor, WizardService } from "./types";
import { useSlots } from "./use-booking-api";

type ErrorCode = "RATE_LIMIT" | "NOT_FOUND" | "UNKNOWN" | "VALIDATION";

export function StepContacts({
  form,
  service,
  doctor,
  date,
  time,
  locale,
  onTimeUnavailable,
  onPickAlternative,
  onSuccess,
}: {
  form: UseFormReturn<ContactValues>;
  service: WizardService;
  doctor: WizardDoctor | "any";
  date: DateKey;
  time: string;
  locale: string;
  onTimeUnavailable: () => void;
  onPickAlternative: (date: DateKey, time: string) => void;
  onSuccess: (booking: BookingConfirmation) => void;
}) {
  const t = useTranslations("booking");
  const doctorKey = doctor === "any" ? "any" : doctor.id;
  const { data, loading } = useSlots(service.id, doctorKey, date);
  const slot = data?.slots.find((s) => formatTime(new Date(s.start)) === time);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<ErrorCode | null>(null);
  const [alternatives, setAlternatives] = useState<Alternative[] | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef(0);
  const ids = { name: useId(), phone: useId(), comment: useId(), consent: useId() };

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // Выбранное время пропало (заняли или ссылка устарела) — возвращаем к выбору времени.
  const handledMissing = useRef(false);
  useEffect(() => {
    if (data && !slot && !handledMissing.current) {
      handledMissing.current = true;
      toast.error(t("errors.SLOT_TAKEN").split(".")[0]);
      onTimeUnavailable();
    }
  }, [data, slot, onTimeUnavailable, t]);

  const { register, control, handleSubmit, formState, setError: setFieldError } = form;
  const errorText = (key?: string) => (key ? t(`validation.${key as "nameRequired"}`) : undefined);

  function submit(values: ContactValues) {
    if (!slot) return;
    setError(null);
    setAlternatives(null);
    startTransition(async () => {
      const result = await submitBooking({
        ...values,
        serviceId: service.id,
        doctorId: doctorKey,
        start: slot.start,
        locale: locale === "ky" ? "ky" : "ru",
        website: honeypotRef.current?.value ?? "",
        startedAt: startedAt.current || Date.now() - 10_000,
      });
      if (result.ok) {
        onSuccess(result.booking);
        return;
      }
      if (result.error === "SLOT_TAKEN") {
        setAlternatives(result.alternatives);
        requestAnimationFrame(() => {
          alertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          alertRef.current?.focus({ preventScroll: true });
        });
        return;
      }
      if (result.error === "VALIDATION") {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          if (field in values) setFieldError(field as keyof ContactValues, { message });
        }
      }
      setError(result.error);
    });
  }

  return (
    <form onSubmit={(e) => void handleSubmit(submit)(e)} noValidate className="max-w-xl space-y-5" aria-busy={pending}>
      {alternatives && (
        <div ref={alertRef} tabIndex={-1} role="alert" className="rounded-3xl border border-warning/50 bg-warning/10 p-5 outline-none">
          <p className="flex gap-2 font-medium text-ink">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
            {t("errors.SLOT_TAKEN")}
          </p>
          {alternatives.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {alternatives.map((a) => {
                const start = new Date(a.start);
                const sameDay = toDateKey(start) === date;
                const label = sameDay ? formatTime(start) : `${formatDateLong(start, locale)}, ${formatTime(start)}`;
                return (
                  <li key={a.start}>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="bg-card"
                      onClick={() => {
                        setAlternatives(null);
                        onPickAlternative(toDateKey(start), formatTime(start));
                      }}
                    >
                      <span className="tabular-nums first-letter:uppercase">{label}</span>
                    </Button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">{t("time.none")}</p>
          )}
        </div>
      )}

      {error && error !== "VALIDATION" && (
        <p role="alert" className="flex gap-2 rounded-2xl bg-destructive/10 p-4 text-sm font-medium text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {t(`errors.${error}`)}
        </p>
      )}

      <Field id={ids.name} label={t("contacts.name")} error={errorText(formState.errors.name?.message)}>
        <Input
          id={ids.name}
          autoComplete="name"
          placeholder={t("contacts.namePlaceholder")}
          aria-invalid={Boolean(formState.errors.name)}
          aria-describedby={formState.errors.name ? `${ids.name}-error` : undefined}
          className="h-12"
          {...register("name")}
        />
      </Field>

      <Field id={ids.phone} label={t("contacts.phone")} error={errorText(formState.errors.phone?.message)}>
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <IMaskInput
              id={ids.phone}
              mask="+{996} (000) 000-000"
              lazy={false}
              placeholderChar="_"
              // Номер, начатый с «0» (0555…), — ноль отбрасываем: код страны уже подставлен.
              prepareChar={(ch: string, masked: { unmaskedValue: string }) =>
                masked.unmaskedValue === "996" && ch === "0" ? "" : ch
              }
              inputMode="tel"
              autoComplete="tel"
              value={field.value}
              onAccept={(value: string) => field.onChange(value)}
              onBlur={field.onBlur}
              inputRef={field.ref}
              aria-invalid={Boolean(formState.errors.phone)}
              aria-describedby={formState.errors.phone ? `${ids.phone}-error` : undefined}
              className={cn(
                "h-12 w-full rounded-xl border border-input bg-card px-3.5 text-base tabular-nums outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
              )}
            />
          )}
        />
      </Field>

      <Field
        id={ids.comment}
        label={
          <>
            {t("contacts.comment")} <span className="font-normal text-muted-foreground">({t("contacts.optional")})</span>
          </>
        }
        error={errorText(formState.errors.comment?.message)}
      >
        <Textarea
          id={ids.comment}
          rows={3}
          placeholder={t("contacts.commentPlaceholder")}
          aria-invalid={Boolean(formState.errors.comment)}
          {...register("comment")}
        />
      </Field>

      {/* Honeypot: невидимое поле, которое заполняют только боты */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input ref={honeypotRef} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div>
        <div className="flex items-start gap-3">
          <Controller
            control={control}
            name="consent"
            render={({ field }) => (
              <Checkbox
                id={ids.consent}
                checked={field.value === true}
                onCheckedChange={(v) => field.onChange(v === true)}
                onBlur={field.onBlur}
                ref={field.ref}
                aria-invalid={Boolean(formState.errors.consent)}
                aria-describedby={formState.errors.consent ? `${ids.consent}-error` : undefined}
                className="mt-0.5 size-5"
              />
            )}
          />
          <label htmlFor={ids.consent} className="text-sm leading-relaxed text-muted-foreground">
            {t.rich("contacts.consent", {
              link: (chunks) => (
                <Link href="/privacy" target="_blank" className="font-medium text-primary underline underline-offset-4">
                  {chunks}
                </Link>
              ),
            })}
          </label>
        </div>
        {formState.errors.consent && (
          <p id={`${ids.consent}-error`} className="mt-2 text-sm text-destructive">
            {errorText(formState.errors.consent.message)}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" className="h-14 w-full text-base sm:w-auto sm:px-10" disabled={pending || loading || !slot}>
        {pending ? (
          <>
            <Loader2 className="animate-spin" /> {t("contacts.submitting")}
          </>
        ) : (
          t("contacts.submit")
        )}
      </Button>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
