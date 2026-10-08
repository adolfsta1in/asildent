import type { Metadata, Viewport } from "next";
import { Geologica, Onest } from "next/font/google";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MobileActionBar } from "@/components/site/mobile-action-bar";
import { JsonLd } from "@/components/site/json-ld";
import { themeToCss, THEMES } from "@/config/themes";
import { isLocale, routing } from "@/i18n/routing";
import { oklchToHex } from "@/lib/color";
import { tr } from "@/lib/localized";
import { clinicJsonLd } from "@/lib/seo/jsonld";
import { getClinic } from "@/lib/settings";
import { siteUrl } from "@/lib/site";
import "../globals.css";

// Шрифты проверены на кыргызские ң, ө, ү (подмножество cyrillic-ext).
// Внимание: у Manrope, Unbounded, Jost нет буквы «ң» — не используйте их для кыргызского текста.
const display = Geologica({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-display",
  display: "swap",
});

const body = Onest({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-body",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const raw = await rootLocale();
  const locale = isLocale(raw) ? raw : "ru";
  const clinic = await getClinic();
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("homeTitle", { name: clinic.name });
  const description = tr(clinic.description, locale);

  return {
    metadataBase: new URL(siteUrl()),
    title: { default: title, template: `%s — ${clinic.name}` },
    description,
    applicationName: clinic.name,
    openGraph: {
      type: "website",
      siteName: clinic.name,
      locale: locale === "ky" ? "ky_KG" : "ru_RU",
      title,
      description,
    },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const clinic = await getClinic();
  return { themeColor: oklchToHex(THEMES[clinic.theme].tokens.background) };
}

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await rootLocale();
  if (!isLocale(locale)) notFound();

  const [clinic, t, messages] = await Promise.all([
    getClinic(),
    getTranslations({ locale, namespace: "nav" }),
    getMessages({ locale }),
  ]);
  // В браузер уходят только переводы, нужные клиентским компонентам шапки и нижней панели.
  // Словарь мастера записи подключается отдельно на странице /booking.
  const clientMessages = { locale: messages.locale, cta: messages.cta, mobileBar: messages.mobileBar };

  return (
    <html lang={locale} className={`${display.variable} ${body.variable}`} data-theme={clinic.theme}>
      <head>
        <style id="clinic-theme" dangerouslySetInnerHTML={{ __html: themeToCss(clinic.theme) }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-[100] rounded-full bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider messages={clientMessages}>
          <Header clinic={clinic} locale={locale} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer clinic={clinic} locale={locale} />
          <MobileActionBar phone={clinic.phones[0] ?? ""} whatsapp={clinic.whatsapp} />
        </NextIntlClientProvider>
        <JsonLd data={clinicJsonLd(clinic, locale)} />
      </body>
    </html>
  );
}
