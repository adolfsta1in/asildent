import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { DoctorSort } from "@/components/admin/doctors/doctor-row-actions";
import { PageTitle } from "@/components/admin/page-title";
import { DoctorAvatar } from "@/components/site/doctor-avatar";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { tr } from "@/lib/localized";

export const metadata: Metadata = { title: "Врачи" };

const WD = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export default async function DoctorsAdminPage() {
  const doctors = await db.doctor.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { services: true } }, scheduleRules: { select: { weekday: true } } },
  });

  return (
    <>
      <PageTitle
        title="Врачи"
        description="Профили, фото, услуги, график работы и отпуска."
        actions={
          <Button asChild>
            <Link href="/admin/doctors/new">
              <Plus /> Добавить врача
            </Link>
          </Button>
        }
      />
      <ul className="space-y-2">
        {doctors.map((d, i) => {
          const name = tr(d.name, "ru");
          const days = [1, 2, 3, 4, 5, 6, 0].filter((w) => d.scheduleRules.some((r) => r.weekday === w));
          return (
            <li key={d.id} className="flex items-center gap-3 rounded-2xl border bg-card p-3 sm:gap-4 sm:p-4">
              <DoctorSort id={d.id} first={i === 0} last={i === doctors.length - 1} label={name} />
              <DoctorAvatar name={name} photoUrl={d.photoUrl} seed={d.slug} alt="" showInitials={false} sizes="56px" className="size-14 shrink-0 rounded-2xl" />
              <Link href={`/admin/doctors/${d.id}`} className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate font-semibold text-ink">{name}</span>
                  {!d.isActive && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">скрыт</span>}
                </span>
                <span className="block truncate text-sm text-muted-foreground">{tr(d.specialty, "ru")}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Услуг: {d._count.services} · {days.length ? days.map((w) => WD[w]).join(" ") : "график не задан"}
                </span>
              </Link>
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                <Link href={`/admin/doctors/${d.id}`}>Изменить</Link>
              </Button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
