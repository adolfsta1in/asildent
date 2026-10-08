import type { Metadata } from "next";
import { PageTitle } from "@/components/admin/page-title";
import { ServiceForm } from "@/components/admin/services/service-form";
import { db } from "@/lib/db";
import { tr } from "@/lib/localized";

export const metadata: Metadata = { title: "Новая услуга" };

export default async function NewServicePage() {
  const [categories, doctors] = await Promise.all([
    db.serviceCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    db.doctor.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  return (
    <div className="max-w-4xl">
      <PageTitle title="Новая услуга" />
      <ServiceForm
        categories={categories.map((c) => ({ id: c.id, name: tr(c.name, "ru") }))}
        doctors={doctors.map((d) => ({ id: d.id, name: tr(d.name, "ru") }))}
      />
    </div>
  );
}
