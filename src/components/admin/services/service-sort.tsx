"use client";

import { moveCategory, moveService } from "@/app/admin/(panel)/services/actions";
import { SortButtons } from "../sort-buttons";

export function ServiceSort(props: { id: string; first: boolean; last: boolean; label: string }) {
  return <SortButtons onMove={(d) => moveService(props.id, d)} {...props} />;
}

export function CategorySort(props: { id: string; first: boolean; last: boolean; label: string }) {
  return <SortButtons onMove={(d) => moveCategory(props.id, d)} {...props} />;
}
