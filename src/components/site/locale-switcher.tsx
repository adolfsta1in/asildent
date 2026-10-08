"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations("locale");
  const current = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={cn("flex items-center rounded-full bg-muted p-1 text-xs font-semibold", pending && "opacity-70", className)}
    >
      {routing.locales.map((locale) => {
        const active = locale === current;
        return (
          <button
            key={locale}
            type="button"
            lang={locale}
            aria-pressed={active}
            aria-label={t(locale)}
            onClick={() => {
              if (active) return;
              const search = typeof window !== "undefined" ? window.location.search : "";
              startTransition(() => {
                // pathname уже без префикса локали; query-параметры (например, шаги записи) сохраняем.
                router.replace(`${pathname}${search}`, { locale, scroll: false });
              });
            }}
            className={cn(
              "min-w-10 rounded-full px-2.5 py-1.5 transition-colors",
              active ? "bg-card text-ink shadow-soft" : "text-muted-foreground hover:text-ink",
            )}
          >
            {t(`short_${locale}`)}
          </button>
        );
      })}
    </div>
  );
}
