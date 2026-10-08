import type { Metadata } from "next";
import { FaqEditor, ReviewsEditor } from "@/components/admin/content/content-editors";
import { PageTitle } from "@/components/admin/page-title";
import { db } from "@/lib/db";
import { asLocalized } from "@/lib/localized";

export const metadata: Metadata = { title: "Отзывы и FAQ" };

export default async function ContentPage() {
  const [reviews, faqs] = await Promise.all([
    db.review.findMany({ orderBy: { sortOrder: "asc" } }),
    db.faq.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  return (
    <>
      <PageTitle title="Отзывы и FAQ" description="Демо-отзывы помечены на сайте. Перед запуском замените их настоящими." />
      <div className="grid gap-8 xl:grid-cols-2">
        <ReviewsEditor
          reviews={reviews.map((r) => ({
            id: r.id,
            authorName: r.authorName,
            text: asLocalized(r.text),
            serviceName: r.serviceName ? asLocalized(r.serviceName) : null,
            rating: r.rating,
            isPublished: r.isPublished,
            isDemo: r.isDemo,
          }))}
        />
        <FaqEditor faqs={faqs.map((f) => ({ id: f.id, question: asLocalized(f.question), answer: asLocalized(f.answer) }))} />
      </div>
    </>
  );
}
