import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Карточка выбора в мастере. Кнопка с aria-pressed: Enter/пробел выбирают и переводят на следующий шаг. */
export function OptionCard({
  selected,
  onClick,
  children,
  aside,
  className,
}: {
  selected?: boolean;
  onClick: () => void;
  children: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "group relative flex w-full items-center gap-4 rounded-3xl border bg-card p-4 text-left transition-[border-color,box-shadow,transform] hover:border-primary/50 hover:shadow-soft active:scale-[0.995] sm:p-5",
        selected && "border-primary ring-2 ring-primary/20",
        className,
      )}
    >
      <span className="min-w-0 flex-1">{children}</span>
      {aside}
      <span
        aria-hidden
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border group-hover:border-primary/50",
        )}
      >
        {selected && <Check className="size-3.5" strokeWidth={3} />}
      </span>
    </button>
  );
}
