import { Info } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/site/page-header";
import { privacyTemplates } from "@/content/privacy";
import { getLocale } from "@/lib/locale";
import { tr } from "@/lib/localized";
import { pageAlternates } from "@/lib/seo/metadata";
import { getClinic } from "@/lib/settings";
import { siteUrl } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("privacyTitle"), alternates: pageAlternates(locale, "/privacy") };
}

/** Простейший рендер markdown-шаблона: заголовки ##, списки «- », абзацы. */
function renderBlocks(md: string) {
  return md
    .trim()
    .split(/\n{2,}/)
    .map((block, i) => {
      if (block.startsWith("## ")) return <h2 key={i}>{block.slice(3)}</h2>;
      if (block.startsWith("- ")) {
        return (
          <ul key={i}>
            {block.split("\n").map((li, j) => (
              <li key={j}>{li.replace(/^- /, "")}</li>
            ))}
          </ul>
        );
      }
      return <p key={i}>{block}</p>;
    });
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  const template = privacyTemplates[locale];
  const [clinic, t, tn] = await Promise.all([
    getClinic(),
    getTranslations({ locale, namespace: "privacy" }),
    getTranslations({ locale, namespace: "footer" }),
  ]);

  const values: Record<string, string> = {
    CLINIC_NAME: clinic.name,
    LEGAL_NAME: clinic.legalName,
    INN: clinic.legalInn,
    SITE_URL: siteUrl().replace(/^https?:\/\//, ""),
    EMAIL: clinic.email,
    PHONE: clinic.phones[0] ?? "",
    ADDRESS: tr(clinic.address, locale),
  };
  const text = template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => values[key] ?? `{{${key}}}`);

  return (
    <>
      <PageHeader locale={locale} crumbs={[{ label: tn("privacy"), href: "/privacy" }]} title={t("title")} />
      <div className="container-page pb-20">
        <p className="mb-8 flex max-w-3xl items-start gap-2 rounded-2xl border border-dashed bg-card px-4 py-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          {t("templateNote")}
        </p>
        <article className="prose-clinic">{renderBlocks(text)}</article>
      </div>
    </>
  );
}
