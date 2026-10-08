"use client";

import { CalendarCheck, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { WhatsAppIcon } from "@/components/icons";
import { Link, usePathname } from "@/i18n/navigation";
import { telHref, whatsappHref } from "@/lib/format";

/** Закреплённая панель на мобильных: позвонить / WhatsApp / записаться. */
export function MobileActionBar({ phone, whatsapp }: { phone: string; whatsapp: string }) {
  const t = useTranslations("cta");
  const tb = useTranslations("mobileBar");
  const pathname = usePathname();
  if (pathname.startsWith("/booking")) return null;

  const item =
    "flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[0.7rem] font-semibold transition-colors";

  return (
    <nav
      aria-label={tb("label")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/90 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch gap-2">
        {phone && (
          <a href={telHref(phone)} className={`${item} text-ink hover:bg-muted`}>
            <Phone className="size-5 text-primary" aria-hidden />
            {t("call")}
          </a>
        )}
        {whatsapp && (
          <a
            href={whatsappHref(whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${item} text-ink hover:bg-muted`}
          >
            <WhatsAppIcon className="size-5 text-[#1DA851]" />
            {t("whatsapp")}
          </a>
        )}
        <Link
          href="/booking"
          className={`${item} flex-[1.4] flex-row gap-2 bg-primary text-sm text-primary-foreground shadow-[0_6px_16px_-6px_var(--primary)] hover:bg-primary-hover`}
        >
          <CalendarCheck className="size-5" aria-hidden />
          {t("bookShort")}
        </Link>
      </div>
    </nav>
  );
}
