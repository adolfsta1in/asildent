import { ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { breadcrumbJsonLd, localizedUrl } from "@/lib/seo/jsonld";
import { cn } from "@/lib/utils";
import { JsonLd } from "./json-ld";

export type Crumb = { label: string; href: string };

/** Шапка внутренней страницы: хлебные крошки (+ JSON-LD), заголовок и подзаголовок. */
export async function PageHeader({
  locale,
  crumbs,
  title,
  lead,
  eyebrow,
  children,
  className,
}: {
  locale: Locale;
  crumbs: Crumb[];
  title: string;
  lead?: string;
  eyebrow?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const t = await getTranslations({ locale, namespace: "nav" });
  const all = [{ label: t("home"), href: "/" }, ...crumbs];

  return (
    <div className={cn("container-page pt-6 pb-10 sm:pt-10 sm:pb-14", className)}>
      <nav aria-label={t("breadcrumbs")}>
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          {all.map((c, i) => {
            const last = i === all.length - 1;
            return (
              <li key={c.href} className="flex items-center gap-1">
                {last ? (
                  <span aria-current="page" className="font-medium text-ink">
                    {c.label}
                  </span>
                ) : (
                  <>
                    <Link href={c.href} className="transition-colors hover:text-ink">
                      {c.label}
                    </Link>
                    <ChevronRight className="size-3.5" aria-hidden />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      {eyebrow && <div className="mt-8">{eyebrow}</div>}
      <h1 className={cn("max-w-4xl text-4xl leading-[1.05] font-bold tracking-[-0.03em] sm:text-5xl lg:text-6xl", eyebrow ? "mt-3" : "mt-8")}>
        {title}
      </h1>
      {lead && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{lead}</p>}
      {children}
      <JsonLd data={breadcrumbJsonLd(all.map((c) => ({ name: c.label, url: localizedUrl(locale, c.href) })))} />
    </div>
  );
}
