export const STATUSES = ["NEW", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;
export type AppointmentStatus = (typeof STATUSES)[number];

export const STATUS_META: Record<AppointmentStatus, { label: string; className: string; dot: string }> = {
  NEW: { label: "Новая", className: "bg-warning/15 text-[oklch(0.45_0.12_70)]", dot: "bg-warning" },
  CONFIRMED: { label: "Подтверждена", className: "bg-primary-soft text-primary-soft-foreground", dot: "bg-primary" },
  COMPLETED: { label: "Завершена", className: "bg-success/12 text-success", dot: "bg-success" },
  CANCELLED: { label: "Отменена", className: "bg-muted text-muted-foreground line-through", dot: "bg-muted-foreground" },
  NO_SHOW: { label: "Не пришёл", className: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
};

/** Статусы, при которых запись занимает время врача. */
export const OCCUPYING: AppointmentStatus[] = ["NEW", "CONFIRMED", "COMPLETED"];

export function isStatus(v: string | null | undefined): v is AppointmentStatus {
  return Boolean(v) && (STATUSES as readonly string[]).includes(v!);
}
