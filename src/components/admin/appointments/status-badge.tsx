import { isStatus, STATUS_META } from "@/lib/appointment-status";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const meta = isStatus(status) ? STATUS_META[status] : null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        meta?.className,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta?.dot)} aria-hidden />
      {meta?.label ?? status}
    </span>
  );
}
