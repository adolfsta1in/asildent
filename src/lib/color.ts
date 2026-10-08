/** Преобразование цветов темы (OKLCH) в sRGB — для favicon/OG-картинок и проверки контраста. */

type RGB = [number, number, number];

export function parseOklch(value: string): [number, number, number] {
  const m = value.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  if (!m) throw new Error(`Не OKLCH: ${value}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/** OKLCH → линейный → sRGB (0..1), с обрезкой по гамуту. */
export function oklchToRgb(value: string): RGB {
  const [L, C, h] = parseOklch(value);
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  const lin: RGB = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return lin.map((c) => {
    const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(Math.max(c, 0), 1 / 2.4) - 0.055;
    return Math.min(1, Math.max(0, v));
  }) as RGB;
}

export function oklchToHex(value: string): string {
  return `#${oklchToRgb(value)
    .map((c) => Math.round(c * 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

function luminance([r, g, b]: RGB) {
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Контраст по WCAG 2.x между двумя цветами OKLCH. */
export function contrastRatio(fg: string, bg: string): number {
  const a = luminance(oklchToRgb(fg));
  const b = luminance(oklchToRgb(bg));
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}
