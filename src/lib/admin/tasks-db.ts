import "server-only";
import type { TaskView } from "@/components/admin/tasks/tasks-ui";
import { formatDateShort, formatTime } from "@/lib/time";
import { appointmentLabel } from "./tasks";

export const taskInclude = { appointment: { select: { id: true, patientName: true, startAt: true } } } as const;

type TaskRow = {
  id: string;
  title: string;
  note: string | null;
  dueDate: string | null;
  dueMin: number | null;
  priority: string;
  isDone: boolean;
  appointment: { id: string; patientName: string; startAt: Date } | null;
};

export function toTaskView(t: TaskRow): TaskView {
  return {
    id: t.id,
    title: t.title,
    note: t.note,
    dueDate: t.dueDate,
    dueMin: t.dueMin,
    priority: t.priority,
    isDone: t.isDone,
    appointment: t.appointment
      ? { id: t.appointment.id, label: appointmentLabel(t.appointment, { date: formatDateShort, time: formatTime }) }
      : null,
  };
}
