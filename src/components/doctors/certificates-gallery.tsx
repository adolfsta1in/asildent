"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Item = { id: string; imageUrl: string; title: string };
type Labels = { open: string; close: string; prev: string; next: string; fallbackTitle: string };

/** Сертификаты врача: превью сеткой, по нажатию — крупно в окне (<dialog>: Esc и фокус — из коробки). */
export function CertificatesGallery({ items, labels }: { items: Item[]; labels: Labels }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const current = index === null ? null : items[index];

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (index !== null && !d.open) d.showModal();
    if (index === null && d.open) d.close();
  }, [index]);

  const step = (dir: -1 | 1) => setIndex((i) => (i === null ? i : (i + dir + items.length) % items.length));

  return (
    <>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((c, i) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="group block w-full text-left"
              aria-label={`${labels.open}: ${c.title || labels.fallbackTitle}`}
            >
              <span className="relative block aspect-[4/3] overflow-hidden rounded-2xl border bg-card transition-shadow group-hover:shadow-lift">
                <Image
                  src={c.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 18vw, (min-width: 640px) 30vw, 45vw"
                  className="object-contain p-1.5 transition-transform group-hover:scale-[1.02]"
                />
              </span>
              {c.title && <span className="mt-2 block text-sm leading-snug text-muted-foreground">{c.title}</span>}
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        onClose={() => setIndex(null)}
        onClick={(e) => e.target === e.currentTarget && setIndex(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") step(-1);
          if (e.key === "ArrowRight") step(1);
        }}
        aria-label={current?.title || labels.fallbackTitle}
        className="m-auto h-[100dvh] max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-ink/85 backdrop:backdrop-blur-sm"
      >
        {current && (
          <div className="pointer-events-none flex size-full flex-col items-center justify-center gap-3 p-4 sm:p-10">
            <div className="pointer-events-auto relative h-full max-h-[80dvh] w-full max-w-4xl">
              <Image src={current.imageUrl} alt={current.title || labels.fallbackTitle} fill sizes="90vw" className="object-contain" />
            </div>
            {current.title && <p className="pointer-events-auto max-w-2xl text-center text-sm text-white/85">{current.title}</p>}
            <div className="pointer-events-auto flex items-center gap-2">
              {items.length > 1 && (
                <button type="button" onClick={() => step(-1)} aria-label={labels.prev} className="flex size-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25">
                  <ChevronLeft className="size-5" />
                </button>
              )}
              {items.length > 1 && (
                <span className="min-w-14 text-center text-sm text-white/70 tabular-nums">
                  {(index ?? 0) + 1} / {items.length}
                </span>
              )}
              {items.length > 1 && (
                <button type="button" onClick={() => step(1)} aria-label={labels.next} className="flex size-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25">
                  <ChevronRight className="size-5" />
                </button>
              )}
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setIndex(null)}
          aria-label={labels.close}
          className="fixed top-4 right-4 flex size-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
        >
          <X className="size-5" />
        </button>
      </dialog>
    </>
  );
}
