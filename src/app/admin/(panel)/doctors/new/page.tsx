import type { Metadata } from "next";
import { DoctorForm } from "@/components/admin/doctors/doctor-form";
import { PageTitle } from "@/components/admin/page-title";

export const metadata: Metadata = { title: "Новый врач" };

export default function NewDoctorPage() {
  return (
    <>
      <PageTitle title="Новый врач" description="После сохранения откроется настройка графика и услуг." />
      <DoctorForm />
    </>
  );
}
