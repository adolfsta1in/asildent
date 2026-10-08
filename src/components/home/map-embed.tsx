"use client";

import { MapPin, Navigation } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Карта 2GIS. Iframe грузится только когда блок появился на экране —
 * тяжёлый виджет не влияет на скорость загрузки страницы.
 * Если ссылки на виджет нет — показываем аккуратную схему с кнопкой маршрута.
 */
export function MapEmbed({
  embedUrl,
  routeUrl,
  title,
  address,
  labels,
}: {
  embedUrl: string;
  routeUrl: string;
  title: string;
  address: string;
  labels: { route: string; load: string };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!embedUrl || !ref.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [embedUrl]);

  return (
    <div ref={ref} className="relative h-full min-h-80 overflow-hidden rounded-3xl border bg-surface">
      {embedUrl && visible ? (
        <iframe src={embedUrl} title={title} loading="lazy" className="absolute inset-0 size-full border-0" allowFullScreen />
      ) : (
        <StylizedMap />
      )}
      {!embedUrl && (
        <div className="absolute inset-x-4 bottom-4 flex flex-col gap-3 rounded-2xl bg-card/95 p-4 shadow-lift backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-sm font-medium text-ink">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            {address}
          </p>
          <Button asChild size="sm" className="shrink-0">
            <a href={routeUrl} target="_blank" rel="noopener noreferrer">
              <Navigation /> {labels.route}
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}

function StylizedMap() {
  return (
    <svg viewBox="0 0 600 420" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
      <rect width="600" height="420" fill="var(--surface)" />
      <path d="M0 300 C120 270 200 330 320 300 S520 250 600 280 L600 420 L0 420Z" fill="var(--primary-soft)" opacity="0.7" />
      <g stroke="var(--card)" strokeWidth="14" strokeLinecap="round">
        <path d="M-20 140 L620 110" />
        <path d="M-20 240 L620 220" />
        <path d="M160 -20 L190 440" />
        <path d="M400 -20 L380 440" />
      </g>
      <g stroke="var(--card)" strokeWidth="6" strokeLinecap="round" opacity="0.9">
        <path d="M-20 60 L620 40" />
        <path d="M-20 360 L620 350" />
        <path d="M60 -20 L80 440" />
        <path d="M280 -20 L290 440" />
        <path d="M520 -20 L500 440" />
      </g>
      <g fill="var(--border)" opacity="0.8">
        <rect x="200" y="140" width="70" height="70" rx="8" />
        <rect x="300" y="150" width="70" height="58" rx="8" />
        <rect x="200" y="20" width="70" height="80" rx="8" />
        <rect x="420" y="130" width="80" height="80" rx="8" />
        <rect x="90" y="150" width="58" height="76" rx="8" />
      </g>
      <g transform="translate(286 128)">
        <circle r="34" fill="var(--primary)" opacity="0.15" />
        <path d="M0 -26c-10 0-18 8-18 18 0 13 18 30 18 30s18-17 18-30c0-10-8-18-18-18z" fill="var(--primary)" />
        <circle cy="-8" r="6.5" fill="var(--primary-foreground)" />
      </g>
    </svg>
  );
}
