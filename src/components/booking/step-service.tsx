"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { OptionCard } from "./option-card";
import type { WizardService } from "./types";

export function StepService({
  services,
  categories,
  selected,
  doctorFilter,
  onClearDoctor,
  onSelect,
}: {
  services: WizardService[];
  categories: { id: string; name: string }[];
  selected?: string;
  doctorFilter?: string;
  onClearDoctor: () => void;
  onSelect: (s: WizardService) => void;
}) {
  const t = useTranslations("booking");
  const ts = useTranslations("services");
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.toLowerCase().replace(/ё/g, "е").trim();
    const filtered = services.filter((s) => !q || `${s.name} ${s.description}`.toLowerCase().replace(/ё/g, "е").includes(q));
    return categories
      .map((c) => ({ ...c, items: filtered.filter((s) => s.categoryId === c.id) }))
      .filter((g) => g.items.length > 0);
  }, [services, categories, query]);

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">{t("service.hint")}</p>
      {doctorFilter && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-primary-soft px-4 py-3 text-sm text-primary-soft-foreground">
          <span>{t("time.doctorAt", { name: doctorFilter })}</span>
          <button type="button" onClick={onClearDoctor} className="ml-auto inline-flex items-center gap-1 font-semibold underline-offset-4 hover:underline">
            <X className="size-4" aria-hidden /> {ts("all")}
          </button>
        </div>
      )}
      {services.length > 6 && (
        <div className="relative mb-5">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <label htmlFor="booking-service-search" className="sr-only">
            {ts("searchLabel")}
          </label>
          <input
            id="booking-service-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={ts("searchPlaceholder")}
            className="h-11 w-full rounded-full border border-input bg-card pr-4 pl-10 outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          />
        </div>
      )}
      {groups.length === 0 && (
        <p className="rounded-3xl border border-dashed p-8 text-center text-muted-foreground">
          {ts("empty", { query })}
        </p>
      )}
      <div className="space-y-7">
        {groups.map((g) => (
          <section key={g.id} aria-labelledby={`bk-cat-${g.id}`}>
            <h3 id={`bk-cat-${g.id}`} className="mb-3 font-sans text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {g.name}
            </h3>
            <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {g.items.map((s) => (
                <li key={s.id}>
                  <OptionCard
                    selected={selected === s.id}
                    onClick={() => onSelect(s)}
                    className="h-full items-start"
                  >
                    <span className="block font-heading font-bold text-ink">{s.name}</span>
                    <span className="mt-1 block text-sm leading-snug text-muted-foreground">{s.description}</span>
                    <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <span className="font-semibold text-ink">{s.priceLabel}</span>
                      <span className="text-muted-foreground">· {s.durationLabel}</span>
                    </span>
                  </OptionCard>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
