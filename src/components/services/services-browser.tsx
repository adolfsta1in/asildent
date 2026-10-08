"use client";

import { Search, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { ServiceRow } from "@/components/site/service-row";
import { cn } from "@/lib/utils";

export type BrowserService = {
  id: string;
  slug: string;
  categoryId: string;
  name: string;
  description: string;
  duration: string;
  price: string;
  search: string;
};

export type BrowserCategory = { id: string; slug: string; name: string };

function normalize(s: string) {
  return s.toLowerCase().replace(/ё/g, "е").trim();
}

export function ServicesBrowser({
  services,
  categories,
  labels,
}: {
  services: BrowserService[];
  categories: BrowserCategory[];
  labels: { search: string; placeholder: string; all: string; empty: string; categories: string; clear: string };
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const deferred = useDeferredValue(query);

  const filtered = useMemo(() => {
    const words = normalize(deferred).split(/\s+/).filter(Boolean);
    return services.filter(
      (s) => (!category || s.categoryId === category) && words.every((w) => s.search.includes(w)),
    );
  }, [services, deferred, category]);

  const groups = categories
    .map((c) => ({ category: c, items: filtered.filter((s) => s.categoryId === c.id) }))
    .filter((g) => g.items.length > 0);

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-4 bg-background/90 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-3xl sm:border sm:px-4 lg:top-[4.5rem]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative lg:w-80">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <label htmlFor="service-search" className="sr-only">
              {labels.search}
            </label>
            <input
              id="service-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={labels.placeholder}
              className="h-11 w-full rounded-full border border-input bg-card pr-10 pl-10 text-[0.95rem] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                aria-label={labels.clear}
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <div role="group" aria-label={labels.categories} className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
            {[{ id: null, name: labels.all }, ...categories].map((c) => {
              const active = category === c.id;
              return (
                <button
                  key={c.id ?? "all"}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                    active ? "bg-ink text-white" : "bg-muted text-ink hover:bg-secondary",
                  )}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div aria-live="polite" className="mt-6">
        {groups.length === 0 ? (
          <p className="rounded-3xl border border-dashed bg-card px-6 py-12 text-center text-muted-foreground">
            {labels.empty.replace("{query}", query)}
          </p>
        ) : (
          groups.map(({ category: c, items }) => (
            <section key={c.id} aria-labelledby={`cat-${c.slug}`} className="mt-8 first:mt-2">
              <h2 id={`cat-${c.slug}`} className="mb-2 flex items-baseline gap-3 px-1 text-2xl font-bold sm:text-3xl">
                {c.name}
                <span className="text-sm font-medium text-muted-foreground">{items.length}</span>
              </h2>
              <ul className="divide-y rounded-3xl border bg-surface/60">
                {items.map((s) => (
                  <li key={s.id}>
                    <ServiceRow
                      href={`/uslugi/${s.slug}`}
                      name={s.name}
                      description={s.description}
                      duration={s.duration}
                      price={s.price}
                      className="rounded-none first:rounded-t-3xl last:rounded-b-3xl"
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
