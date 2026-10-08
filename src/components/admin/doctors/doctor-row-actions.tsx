"use client";

import { moveDoctor } from "@/app/admin/(panel)/doctors/actions";
import { SortButtons } from "../sort-buttons";

export function DoctorSort({ id, first, last, label }: { id: string; first: boolean; last: boolean; label: string }) {
  return <SortButtons onMove={(d) => moveDoctor(id, d)} first={first} last={last} label={label} />;
}
