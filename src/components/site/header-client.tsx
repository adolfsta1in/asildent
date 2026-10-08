"use client";

import { Menu, Phone } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Link, usePathname } from "@/i18n/navigation";
import { telHref } from "@/lib/format";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "./locale-switcher";

type NavItem = { href: string; label: string };

export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-300",
        scrolled
          ? "border-border/70 bg-background/85 shadow-[0_8px_24px_-18px_oklch(0.3_0.03_210/0.35)] backdrop-blur-xl"
          : "border-transparent bg-background/0",
      )}
    >
      {children}
    </header>
  );
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({ items, className }: { items: NavItem[]; className?: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className={className}>
      <ul className="flex items-center gap-1 whitespace-nowrap">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-[0.92rem] font-medium transition-colors",
                  active ? "text-ink" : "text-muted-foreground hover:text-ink",
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-primary" aria-hidden />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MobileMenu({
  items,
  phone,
  labels,
  header,
}: {
  items: NavItem[];
  phone?: string;
  labels: { menu: string; close: string; book: string; call: string };
  header: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="xl:hidden" aria-label={labels.menu}>
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[88vw] max-w-sm gap-0 p-0">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle asChild>
            <div>{header}</div>
          </SheetTitle>
        </SheetHeader>
        <nav aria-label={labels.menu} className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.href}>
                <SheetClose asChild>
                  <Link
                    href={item.href}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    className="flex items-center rounded-2xl px-4 py-3.5 font-heading text-lg font-semibold text-ink transition-colors hover:bg-muted aria-[current=page]:bg-primary-soft aria-[current=page]:text-primary-soft-foreground"
                  >
                    {item.label}
                  </Link>
                </SheetClose>
              </li>
            ))}
          </ul>
          <div className="mt-6 px-4">
            <LocaleSwitcher />
          </div>
        </nav>
        <div className="grid gap-2 border-t p-4">
          <SheetClose asChild>
            <Button asChild size="lg">
              <Link href="/booking">{labels.book}</Link>
            </Button>
          </SheetClose>
          {phone && (
            <Button asChild size="lg" variant="outline">
              <a href={telHref(phone)}>
                <Phone /> {phone}
              </a>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
