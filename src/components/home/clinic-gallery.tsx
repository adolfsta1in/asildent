import Image from "next/image";
import { Reveal } from "@/components/site/reveal";
import { media } from "@/config/media";
import type { Locale } from "@/i18n/routing";
import { tr } from "@/lib/localized";

/** Фото клиники (media.clinic): 2 колонки на телефоне, 4 — на десктопе. */
export function ClinicGallery({ locale }: { locale: Locale }) {
  if (media.clinic.length === 0) return null;
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {media.clinic.map((p, i) => (
        <Reveal
          as="li"
          key={p.src}
          className={`relative aspect-[3/4] overflow-hidden rounded-3xl bg-muted ${i % 2 === 1 ? "lg:translate-y-8" : ""}`}
        >
          <Image
            src={p.src}
            alt={tr(p.caption, locale)}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover"
          />
          <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10 text-xs leading-snug font-medium text-white sm:p-5 sm:pt-14 sm:text-sm">
            {tr(p.caption, locale)}
          </p>
        </Reveal>
      ))}
    </ul>
  );
}
