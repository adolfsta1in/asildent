import { ArrowLeft, CalendarCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { ToothIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { isLocale } from "@/i18n/routing";

export default async function NotFound() {
  const raw = await rootLocale().catch(() => undefined);
  const locale = isLocale(raw) ? raw : "ru";
  const [t, tc] = await Promise.all([
    getTranslations({ locale, namespace: "notFound" }),
    getTranslations({ locale, namespace: "cta" }),
  ]);

  return (
    <section className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <div className="relative mb-8">
        <span className="font-heading text-[8rem] leading-none font-extrabold text-primary-soft sm:text-[11rem]">404</span>
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-20 items-center justify-center rounded-3xl bg-card shadow-lift">
            <ToothIcon className="size-10 text-primary" />
          </span>
        </span>
      </div>
      <h1 className="text-3xl font-bold sm:text-4xl">{t("title")}</h1>
      <p className="mt-4 max-w-md text-muted-foreground">{t("text")}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/booking">
            <CalendarCheck /> {tc("book")}
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/">
            <ArrowLeft /> {t("home")}
          </Link>
        </Button>
      </div>
    </section>
  );
}
