import { Suspense } from "react";
import {
  AdminBottomNav,
  AdminBottomNavStatic,
  AdminSidebar,
  AdminSidebarStatic,
  AdminTopbar,
} from "@/components/admin/nav";
import { requireAdmin } from "@/lib/auth/session";
import { getClinic } from "@/lib/settings";
import { AdminSkeleton } from "@/components/admin/skeleton";

async function AuthGate({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return children;
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const clinic = await getClinic();
  return (
    <div className="lg:pl-64">
      <Suspense fallback={<AdminSidebarStatic clinicName={clinic.name} />}>
        <AdminSidebar clinicName={clinic.name} />
      </Suspense>
      <AdminTopbar clinicName={clinic.name} />
      <main className="mx-auto max-w-7xl px-4 pt-5 pb-28 sm:px-6 lg:px-10 lg:pt-10 lg:pb-16">
        <Suspense fallback={<AdminSkeleton />}>
          <AuthGate>{children}</AuthGate>
        </Suspense>
      </main>
      <Suspense fallback={<AdminBottomNavStatic />}>
        <AdminBottomNav />
      </Suspense>
    </div>
  );
}
