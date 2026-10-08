import type { Metadata } from "next";
import { NewAppointmentForm } from "@/components/admin/appointments/new-form";
import { PageTitle } from "@/components/admin/page-title";
import { todayKey } from "@/lib/admin/appointments";
import { db } from "@/lib/db";
import { tr } from "@/lib/localized";

export const metadata: Metadata = { title: "Новая запись" };

export default async function NewAppointmentPage() {
  const [services, doctors] = await Promise.all([
    db.service.findMany({
      where: { isActive: true },
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      include: { doctors: { select: { doctorId: true } } },
    }),
    db.doctor.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <>
      <PageTitle title="Новая запись" description="Например, если пациент записался по телефону. Время проверяется так же, как на сайте." />
      <NewAppointmentForm
        today={await todayKey()}
        services={services.map((s) => ({
          id: s.id,
          name: tr(s.name, "ru"),
          durationMin: s.durationMin,
          doctorIds: s.doctors.map((d) => d.doctorId),
        }))}
        doctors={doctors.map((d) => ({ id: d.id, name: tr(d.name, "ru") }))}
      />
    </>
  );
}
