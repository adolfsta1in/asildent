import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Мягкое появление блока при прокрутке — на чистом CSS (scroll-driven animations),
 * без JavaScript, чтобы не утяжелять мобильную загрузку. В браузерах без поддержки
 * и при prefers-reduced-motion блок просто виден сразу. Стили — .reveal в globals.css.
 */
export function Reveal({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const Comp = as;
  return <Comp className={cn("reveal", className)}>{children}</Comp>;
}
