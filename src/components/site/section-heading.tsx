import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  lead,
  action,
  align = "left",
  className,
  id,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  action?: ReactNode;
  align?: "left" | "center";
  className?: string;
  id?: string;
}) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-6 sm:mb-14 lg:flex-row lg:items-end lg:justify-between",
        align === "center" && "items-center text-center lg:flex-col lg:items-center",
        className,
      )}
    >
      <div className={cn(align === "center" && "flex flex-col items-center")}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 id={id} className="section-title mt-3">
          {title}
        </h2>
        {lead && <p className="section-lead">{lead}</p>}
      </div>
      {action}
    </div>
  );
}
