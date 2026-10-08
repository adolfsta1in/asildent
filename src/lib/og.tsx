import { readFile } from "node:fs/promises";
import { join } from "node:path";

const TOOTH_PATH =
  "M14.2 9.6c2-.6 3.8.1 5.8 1 2-.9 3.8-1.6 5.8-1 3.3 1 4.8 4.6 3.9 8.5-.5 2.2-1.5 3.7-2 5.9-.6 2.8-.8 5.7-2 7.7-.8 1.3-2.4 1.1-2.9-.3-.6-1.8-.8-4.6-2.8-4.6s-2.2 2.8-2.8 4.6c-.5 1.4-2.1 1.6-2.9.3-1.2-2-1.4-4.9-2-7.7-.5-2.2-1.5-3.7-2-5.9-.9-3.9.6-7.5 3.9-8.5Z";

/** Фирменный знак (зуб на скруглённом квадрате) для favicon и OG-картинки. */
export function MarkSvg({ size, bg, fg }: { size: number; bg: string; fg: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect width="40" height="40" rx="11" fill={bg} />
      <path d={TOOTH_PATH} fill={fg} />
    </svg>
  );
}

/** Шрифт с кириллицей (включая ң, ө, ү) для генерации картинок. */
export async function ogFonts() {
  const [regular, bold] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/fonts/Onest-500.ttf")),
    readFile(join(process.cwd(), "src/assets/fonts/Onest-700.ttf")),
  ]);
  return [
    { name: "Onest", data: regular, weight: 500 as const, style: "normal" as const },
    { name: "Onest", data: bold, weight: 700 as const, style: "normal" as const },
  ];
}
