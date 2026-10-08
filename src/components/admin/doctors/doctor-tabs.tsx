"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = [
  { id: "profile", label: "Профиль" },
  { id: "services", label: "Услуги" },
  { id: "schedule", label: "График" },
] as const;

/** Вкладки карточки врача; активная вкладка — в URL (?tab=), чтобы ссылка открывала нужный раздел. */
export function DoctorTabs({ panels }: { panels: Record<(typeof TABS)[number]["id"], ReactNode> }) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const current = TABS.some((t) => t.id === sp.get("tab")) ? (sp.get("tab") as string) : "profile";

  return (
    <Tabs value={current} onValueChange={(v) => router.replace(`${pathname}?tab=${v}`, { scroll: false })}>
      <TabsList className="mb-5">
        {TABS.map((t) => (
          <TabsTrigger key={t.id} value={t.id} className="px-4">
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {TABS.map((t) => (
        <TabsContent key={t.id} value={t.id} className="space-y-5">
          {panels[t.id]}
        </TabsContent>
      ))}
    </Tabs>
  );
}
