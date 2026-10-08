"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

/** Сортировка кнопками ↑/↓ — надёжнее перетаскивания на телефоне. */
export function SortButtons({
  onMove,
  first,
  last,
  label,
}: {
  onMove: (direction: -1 | 1) => Promise<void>;
  first: boolean;
  last: boolean;
  label: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex flex-col">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={first || pending}
        onClick={() => startTransition(() => onMove(-1))}
        aria-label={`Поднять: ${label}`}
      >
        <ArrowUp />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={last || pending}
        onClick={() => startTransition(() => onMove(1))}
        aria-label={`Опустить: ${label}`}
      >
        <ArrowDown />
      </Button>
    </div>
  );
}
