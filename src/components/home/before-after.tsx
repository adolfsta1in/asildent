"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

type Labels = { before: string; after: string; placeholder: string; slider: string; cases: string[] };
type CaseImages = { before: string; after: string };

/** Слайдер «до/после». Есть фото кейса — показываем их, нет — аккуратные заглушки. */
export function BeforeAfter({ labels, images = [] }: { labels: Labels; images?: CaseImages[] }) {
  const [value, setValue] = useState(50);
  const [active, setActive] = useState(0);
  const id = useId();
  const photo = images[active];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_18rem] lg:items-start">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border bg-card select-none sm:aspect-[16/10]">
        {photo ? (
          <CasePhoto src={photo.after} alt={`${labels.cases[active]} — ${labels.after}`} />
        ) : (
          <TeethIllustration variant="after" seed={active} className="absolute inset-0" />
        )}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}>
          {photo ? (
            <CasePhoto src={photo.before} alt={`${labels.cases[active]} — ${labels.before}`} />
          ) : (
            <TeethIllustration variant="before" seed={active} className="absolute inset-0" />
          )}
        </div>
        <div className="pointer-events-none absolute inset-y-0" style={{ left: `${value}%` }} aria-hidden>
          <div className="absolute inset-y-0 -left-px w-0.5 bg-card shadow-[0_0_0_1px_oklch(0_0_0/0.06)]" />
          <div className="absolute top-1/2 -left-5 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-card text-ink shadow-lift">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
            </svg>
          </div>
        </div>
        <span className="absolute top-4 left-4 rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold text-white">
          {labels.before}
        </span>
        <span className="absolute top-4 right-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          {labels.after}
        </span>
        {!photo && (
          <p className="absolute inset-x-0 bottom-4 mx-auto w-fit max-w-[90%] rounded-full bg-card/90 px-4 py-1.5 text-center text-xs font-medium text-muted-foreground backdrop-blur">
            {labels.placeholder}
          </p>
        )}
        <label htmlFor={id} className="sr-only">
          {labels.slider}
        </label>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="absolute inset-0 size-full cursor-ew-resize opacity-0"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col" role="tablist" aria-label={labels.slider}>
        {labels.cases.map((c, i) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={active === i}
            onClick={() => {
              setActive(i);
              setValue(50);
            }}
            className={cn(
              "shrink-0 rounded-2xl border px-5 py-4 text-left text-sm font-semibold transition-colors",
              active === i ? "border-primary bg-primary-soft text-primary-soft-foreground" : "bg-card text-ink hover:border-input",
            )}
          >
            <span className="mr-2 font-heading text-muted-foreground">0{i + 1}</span>
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

function CasePhoto({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(min-width: 1024px) 60vw, 100vw"
      className="pointer-events-none object-cover"
      draggable={false}
    />
  );
}

function TeethIllustration({ variant, seed, className }: { variant: "before" | "after"; seed: number; className?: string }) {
  const before = variant === "before";
  // Верхний ряд: 8 зубов по дуге. Тонкая линейная графика — заглушка вместо фото.
  const widths = [26, 30, 34, 42, 42, 34, 30, 26];
  const total = widths.reduce((a, b) => a + b, 0) + widths.length * 3;
  let x = 300 - total / 2;
  const tooth = before ? `oklch(${0.9 - seed * 0.015} 0.055 ${85 - seed * 4})` : "oklch(0.995 0.003 90)";
  return (
    <svg viewBox="0 0 600 375" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <rect width="600" height="375" fill={before ? "oklch(0.95 0.012 70)" : "var(--surface)"} />
      <g opacity="0.5" stroke={before ? "oklch(0.85 0.02 70)" : "var(--border)"}>
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={i * 54} y1="0" x2={i * 54 - 120} y2="375" strokeWidth="1" />
        ))}
      </g>
      {/* губы */}
      <path
        d="M150 190 C210 130 260 150 300 158 C340 150 390 130 450 190 C400 255 350 268 300 268 C250 268 200 255 150 190Z"
        fill={before ? "oklch(0.78 0.06 25)" : "oklch(0.8 0.07 18)"}
        opacity="0.55"
      />
      <path d="M168 191 C230 178 370 178 432 191 C395 238 350 250 300 250 C250 250 205 238 168 191Z" fill="oklch(0.35 0.04 20)" opacity="0.75" />
      <g>
        {widths.map((w, i) => {
          const cx = x;
          x += w + 3;
          const mid = cx + w / 2;
          const arc = Math.abs(mid - 300) / 300;
          const y = 186 + arc * arc * 26;
          const tilt = before ? (((i * 5 + seed * 3) % 5) - 2) * 2.5 : 0;
          return (
            <rect
              key={i}
              x={cx}
              y={y}
              width={w}
              height={30 - arc * 6}
              rx={7}
              fill={tooth}
              stroke={before ? "oklch(0.75 0.05 75)" : "oklch(0.88 0.01 200)"}
              strokeWidth="1"
              transform={`rotate(${tilt} ${mid} ${y + 15})`}
            />
          );
        })}
      </g>
    </svg>
  );
}
