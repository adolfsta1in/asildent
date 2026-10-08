import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import type { ClinicSettings } from "@/lib/settings";
import { NAV_ITEMS } from "@/lib/site";
import { HeaderShell, MobileMenu, NavLinks } from "./header-client";
import { LocaleSwitcher } from "./locale-switcher";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { telHref } from "@/lib/format";
import { Phone } from "lucide-react";

export async function Header({ clinic, locale }: { clinic: ClinicSettings; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "nav" });
  const tc = await getTranslations({ locale, namespace: "cta" });
  const items = NAV_ITEMS.map((i) => ({ href: i.href, label: t(i.key) }));
  const phone = clinic.phones[0];

  return (
    <HeaderShell>
      <div className="container-page flex h-16 items-center gap-4 lg:h-[4.5rem]">
        <Link href="/" className="-m-1 rounded-xl p-1" aria-label={`${clinic.name} — ${t("home")}`}>
          <Logo name={clinic.shortName} logoUrl={clinic.logoUrl} />
        </Link>

        <NavLinks items={items} className="ml-4 hidden xl:flex" />

        <div className="ml-auto flex items-center gap-2">
          {phone && (
            <a
              href={telHref(phone)}
              className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap text-ink transition-colors hover:text-primary 2xl:flex"
            >
              <Phone className="size-4 text-primary" aria-hidden />
              {phone}
            </a>
          )}
          <LocaleSwitcher className="hidden sm:flex" />
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/booking">{tc("book")}</Link>
          </Button>
          <MobileMenu
            items={items}
            phone={phone}
            labels={{ menu: t("menu"), close: t("closeMenu"), book: tc("book"), call: tc("call") }}
            header={<Logo name={clinic.shortName} logoUrl={clinic.logoUrl} />}
          />
        </div>
      </div>
    </HeaderShell>
  );
}
