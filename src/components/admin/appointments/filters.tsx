"use client";

import { CalendarDays, Columns3, Download, List, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUSES, STATUS_META } from "@/lib/appointment-status";
import { cn } from "@/lib/utils";

const VIEWS = [
  { id: "list", label: "Список", Icon: List },
  { id: "day", label: "День", Icon: Columns3 },
  { id: "week", label: "Неделя", Icon: CalendarDays },
] as const;

export function AppointmentFilters({ doctors }: { doctors: { id: string; name: string }[] }) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const view = sp.get("view") ?? "list";
  const [q, setQ] = useState(sp.get("q") ?? "");

  function update(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(sp);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    startTransition(() => router.replace(`${pathname}?${next}`, { scroll: false }));
  }

  const exportParams = new URLSearchParams(sp);
  exportParams.delete("view");

  return (
    <div className={cn("space-y-3", pending && "opacity-70 transition-opacity")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Вид" className="inline-flex rounded-full bg-muted p-1">
          {VIEWS.map(({ id, label, Icon }) => (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={view === id}
              onClick={() => update({ view: id === "list" ? undefined : id })}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                view === id ? "bg-card text-ink shadow-soft" : "text-muted-foreground hover:text-ink",
              )}
            >
              <Icon className="size-4" aria-hidden /> {label}
            </button>
          ))}
        </div>
        <Button asChild variant="outline" size="sm">
          <a href={`/api/admin/appointments/export?${exportParams}`} download>
            <Download /> CSV
          </a>
        </Button>
      </div>

      <div className="grid gap-2 rounded-2xl border bg-card p-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto_auto]">
        <form
          className="relative sm:col-span-2 lg:col-span-1"
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: q.trim() || undefined });
          }}
        >
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onBlur={() => q !== (sp.get("q") ?? "") && update({ q: q.trim() || undefined })}
            placeholder="Имя, телефон или номер записи"
            aria-label="Поиск"
            className="h-10 pl-9"
          />
        </form>
        <Select value={sp.get("doctor") ?? "all"} onValueChange={(v) => update({ doctor: v === "all" ? undefined : v })}>
          <SelectTrigger aria-label="Врач" className="h-10 w-full rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все врачи</SelectItem>
            {doctors.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sp.get("status") ?? "all"} onValueChange={(v) => update({ status: v === "all" ? undefined : v })}>
          <SelectTrigger aria-label="Статус" className="h-10 w-full rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_META[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {view === "list" ? (
          <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
            <Input
              type="date"
              aria-label="С даты"
              value={sp.get("from") ?? ""}
              onChange={(e) => update({ from: e.target.value || undefined })}
              className="h-10 min-w-0"
            />
            <span className="text-muted-foreground">—</span>
            <Input
              type="date"
              aria-label="По дату"
              value={sp.get("to") ?? ""}
              onChange={(e) => update({ to: e.target.value || undefined })}
              className="h-10 min-w-0"
            />
          </div>
        ) : (
          <Input
            type="date"
            aria-label="Дата"
            value={sp.get("date") ?? ""}
            onChange={(e) => update({ date: e.target.value || undefined })}
            className="h-10"
          />
        )}
        <Button asChild variant="ghost" className="h-10">
          <Link href={`${pathname}${view === "list" ? "" : `?view=${view}`}`}>
            <X /> Сбросить
          </Link>
        </Button>
      </div>
    </div>
  );
}
