import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DoctorForm } from "@/components/admin/doctors/doctor-form";
import { DoctorTabs } from "@/components/admin/doctors/doctor-tabs";
import { ExceptionsEditor } from "@/components/admin/doctors/exceptions-editor";
import { ScheduleEditor } from "@/components/admin/doctors/schedule-editor";
import { ServicesPicker } from "@/components/admin/doctors/services-picker";
import { DeleteDoctorButton } from "@/components/admin/doctors/delete-doctor";
import { Button } from "@/components/ui/button";
import { todayKey } from "@/lib/admin/appointments";
import { db } from "@/lib/db";
import { asLocalized, asLocalizedList, tr } from "@/lib/localized";

export const metadata: Metadata = { title: "Врач" };

export default async function DoctorEditPage({ params }: PageProps<"/admin/doctors/[id]">) {
  const { id } = await params;
  const today = await todayKey();
  const [doctor, categories] = await Promise.all([
    db.doctor.findUnique({
      where: { id },
      include: {
        services: true,
        scheduleRules: true,
        exceptions: { where: { date: { gte: today } }, orderBy: { date: "asc" } },
      },
    }),
    db.serviceCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: { services: { orderBy: { sortOrder: "asc" } } },
    }),
  ]);
  if (!doctor) notFound();
  const name = tr(doctor.name, "ru");

  return (
    <>
      <Link href="/admin/doctors" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-ink">
        <ArrowLeft className="size-4" /> Все врачи
      </Link>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">{name}</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={`/vrachi/${doctor.slug}`} target="_blank">
              <ExternalLink /> На сайте
            </a>
          </Button>
          <DeleteDoctorButton id={doctor.id} />
        </div>
      </div>
      <DoctorTabs
        panels={{
          profile: (
            <DoctorForm
              doctor={{
                id: doctor.id,
                slug: doctor.slug,
                name: asLocalized(doctor.name),
                specialty: asLocalized(doctor.specialty),
                bio: asLocalized(doctor.bio),
                education: asLocalizedList(doctor.education),
                experienceSince: doctor.experienceSince,
                photoUrl: doctor.photoUrl,
                isActive: doctor.isActive,
              }}
            />
          ),
          services: (
            <ServicesPicker
              doctorId={doctor.id}
              selected={doctor.services.map((s) => s.serviceId)}
              groups={categories
                .filter((c) => c.services.length > 0)
                .map((c) => ({
                  category: tr(c.name, "ru"),
                  services: c.services.map((s) => ({ id: s.id, name: tr(s.name, "ru"), durationMin: s.durationMin })),
                }))}
            />
          ),
          schedule: (
            <>
              <ScheduleEditor doctorId={doctor.id} rules={doctor.scheduleRules} />
              <ExceptionsEditor doctorId={doctor.id} exceptions={doctor.exceptions} today={today} />
            </>
          ),
        }}
      />
    </>
  );
}
