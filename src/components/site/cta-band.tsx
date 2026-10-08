import { CalendarCheck, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { WhatsAppIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { telHref, whatsappHref } from "@/lib/format";
import type { ClinicSettings } from "@/lib/settings";

export async function CtaBand({ clinic, locale }: { clinic: ClinicSettings; locale: Locale }) {
  const [t, tb] = await Promise.all([
    getTranslations({ locale, namespace: "cta" }),
    getTranslations({ locale, namespace: "booking" }),
  ]);
  return (
    <section className="container-page py-16 sm:py-20">
      <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-12 text-primary-foreground sm:px-12 sm:py-16">
        <div aria-hidden className="absolute -top-24 -right-16 size-72 rounded-full bg-white/10" />
        <div aria-hidden className="absolute -bottom-32 left-1/3 size-80 rounded-full bg-black/5" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">{tb("title")}</h2>
            <p className="mt-3 text-lg text-primary-foreground/85">{tb("lead")}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-14 bg-card px-7 text-base text-ink shadow-none hover:bg-card/90">
              <Link href="/booking">
                <CalendarCheck /> {t("book")}
              </Link>
            </Button>
            {clinic.whatsapp && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 border-white/40 bg-transparent px-6 text-base text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              >
                <a href={whatsappHref(clinic.whatsapp)} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="size-5" /> {t("whatsapp")}
                </a>
              </Button>
            )}
            {clinic.phones[0] && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 border-white/40 bg-transparent px-6 text-base text-primary-foreground hover:bg-white/10 hover:text-primary-foreground sm:hidden"
              >
                <a href={telHref(clinic.phones[0])}>
                  <Phone /> {t("call")}
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
