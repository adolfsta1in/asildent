import type { Metadata } from "next";
import { CasesEditor } from "@/components/admin/cases/cases-editor";
import { PageTitle } from "@/components/admin/page-title";
import { db } from "@/lib/db";
import { asLocalized, tr } from "@/lib/localized";

export const metadata: Metadata = { title: "До и после" };

export default async function CasesPage() {
  const [cases, doctors] = await Promise.all([
    db.beforeAfterCase.findMany({ orderBy: { sortOrder: "asc" } }),
    db.doctor.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  return (
    <>
      <PageTitle
        title="До и после"
        description="Кейсы для слайдера на главной. Порядок здесь — порядок на сайте."
      />
      <CasesEditor
        cases={cases.map((c) => ({
          id: c.id,
          beforeUrl: c.beforeUrl,
          afterUrl: c.afterUrl,
          title: asLocalized(c.title),
          description: asLocalized(c.description),
          doctorId: c.doctorId,
          isPublished: c.isPublished,
        }))}
        doctors={doctors.map((d) => ({ id: d.id, name: tr(d.name, "ru") }))}
      />
    </>
  );
}
