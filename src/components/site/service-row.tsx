import { ArrowUpRight, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Строка прайса: название, описание, длительность, цена. Ведёт на страницу услуги. */
export function ServiceRow({
  href,
  name,
  description,
  duration,
  price,
  category,
  className,
}: {
  href: string;
  name: string;
  description?: string;
  duration: string;
  price: string;
  category?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group grid grid-cols-[1fr_auto] items-start gap-x-6 gap-y-2 rounded-2xl px-4 py-5 transition-colors hover:bg-card sm:px-5",
        className,
      )}
    >
      <span className="min-w-0">
        {category && (
          <span className="mb-1.5 block text-xs font-semibold tracking-wide text-primary uppercase">{category}</span>
        )}
        <span className="flex items-center gap-1.5 font-heading text-[1.05rem] font-bold text-ink sm:text-lg">
          {name}
          <ArrowUpRight
            className="size-4 shrink-0 -translate-x-1 text-primary opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
            aria-hidden
          />
        </span>
        {description && <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{description}</span>}
      </span>
      <span className="flex flex-col items-end gap-1.5 text-right">
        <span className="font-heading text-[1.05rem] font-bold whitespace-nowrap text-ink sm:text-lg">{price}</span>
        <span className="flex items-center gap-1 text-xs whitespace-nowrap text-muted-foreground">
          <Clock className="size-3.5" aria-hidden />
          {duration}
        </span>
      </span>
    </Link>
  );
}
