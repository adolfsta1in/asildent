import Image from "next/image";
import { cn } from "@/lib/utils";

const TONES = [
  { bg: "var(--primary-soft)", fg: "var(--primary)", accent: "var(--surface)" },
  { bg: "var(--accent)", fg: "var(--accent-foreground)", accent: "var(--card)" },
  { bg: "var(--secondary)", fg: "var(--primary-soft-foreground)", accent: "var(--primary-soft)" },
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Фото врача или нейтральная заглушка (силуэт в цветах темы).
 * Заглушка нужна для демо: никаких фотографий реальных людей.
 */
export function DoctorAvatar({
  name,
  photoUrl,
  seed,
  className,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw",
  priority = false,
  alt,
  showInitials = true,
}: {
  name: string;
  photoUrl: string | null;
  seed: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  alt: string;
  showInitials?: boolean;
}) {
  if (photoUrl) {
    return (
      <div className={cn("relative overflow-hidden bg-muted", className)}>
        <Image src={photoUrl} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }

  const tone = TONES[hash(seed) % TONES.length];
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ background: tone.bg }}
      role="img"
      aria-label={alt}
    >
      <svg
        viewBox="0 0 300 360"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 size-full"
        aria-hidden
      >
        <circle cx="250" cy="60" r="90" fill={tone.accent} opacity="0.55" />
        <circle cx="40" cy="300" r="70" fill={tone.accent} opacity="0.4" />
        <g fill={tone.fg} opacity="0.2">
          <circle cx="150" cy="150" r="58" />
          <path d="M40 380c0-72 49-122 110-122s110 50 110 122z" />
        </g>
        <path
          d="M118 268c10 16 22 26 32 26s22-10 32-26"
          fill="none"
          stroke={tone.fg}
          strokeOpacity="0.25"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      {showInitials && (
        <span
          className="absolute right-3 bottom-3 rounded-full bg-card/85 px-2.5 py-1 font-heading text-xs font-bold tracking-wide backdrop-blur"
          style={{ color: tone.fg }}
          aria-hidden
        >
          {initials}
        </span>
      )}
    </div>
  );
}
