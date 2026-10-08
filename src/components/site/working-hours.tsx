import { getTranslations } from "next-intl/server";
import type { WorkingHours as WH } from "@/config/clinic";
import { groupWorkingHours } from "@/lib/hours";
import { cn } from "@/lib/utils";

export async function WorkingHours({
  hours,
  locale,
  className,
  tone = "default",
}: {
  hours: WH;
  locale: string;
  className?: string;
  tone?: "default" | "inverted";
}) {
  const t = await getTranslations({ locale: locale as "ru", namespace: "common" });
  const groups = groupWorkingHours(hours);
  const dayLabel = (d: number) => t(`weekdaysShort.${String(d) as "0"}`);

  return (
    <dl className={cn("space-y-1.5 text-sm", className)}>
      {groups.map((g) => (
        <div key={g.days.join()} className="flex items-baseline justify-between gap-6">
          <dt className={tone === "inverted" ? "text-white/70" : "text-muted-foreground"}>
            {g.days.length > 1 ? `${dayLabel(g.days[0])}–${dayLabel(g.days.at(-1)!)}` : dayLabel(g.days[0])}
          </dt>
          <dd className="font-medium tabular-nums">
            {g.hours ? `${g.hours.open}–${g.hours.close}` : t("closed")}
          </dd>
        </div>
      ))}
    </dl>
  );
}
