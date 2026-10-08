"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef } from "react";
import { DoctorCard, type DoctorCardData } from "@/components/site/doctor-card";
import { Button } from "@/components/ui/button";

/** Лёгкая карусель на CSS scroll-snap: свайп на телефоне, кнопки и клавиатура на десктопе. */
export function DoctorsCarousel({
  doctors,
  labels,
}: {
  doctors: DoctorCardData[];
  labels: { prev: string; next: string };
}) {
  const ref = useRef<HTMLUListElement>(null);

  function scroll(direction: -1 | 1) {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  return (
    <div>
      <ul
        ref={ref}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:gap-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {doctors.map((d) => (
          <li key={d.slug} className="w-[78%] shrink-0 snap-start sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1.125rem)]">
            <DoctorCard doctor={d} />
          </li>
        ))}
      </ul>
      <div className="mt-8 flex justify-end gap-2">
        <Button variant="outline" size="icon-lg" onClick={() => scroll(-1)} aria-label={labels.prev}>
          <ArrowLeft />
        </Button>
        <Button variant="outline" size="icon-lg" onClick={() => scroll(1)} aria-label={labels.next}>
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
