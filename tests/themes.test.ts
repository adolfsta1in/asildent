import { describe, expect, it } from "vitest";
import { THEMES, THEME_IDS } from "@/config/themes";
import { contrastRatio, oklchToHex } from "@/lib/color";

// Пары «текст / фон», которые реально встречаются на сайте. Порог WCAG AA для обычного текста — 4.5.
const PAIRS: [string, string][] = [
  ["foreground", "background"],
  ["ink", "background"],
  ["muted-foreground", "background"],
  ["muted-foreground", "surface"],
  ["muted-foreground", "card"],
  ["primary-foreground", "primary"],
  ["primary-foreground", "primary-hover"],
  ["primary", "background"],
  ["primary", "card"],
  ["primary-soft-foreground", "primary-soft"],
  ["secondary-foreground", "secondary"],
  ["accent-foreground", "accent"],
];

describe("контраст цветовых тем (WCAG AA)", () => {
  for (const id of THEME_IDS) {
    const t = THEMES[id].tokens as Record<string, string>;
    it.each(PAIRS)(`${id}: %s на %s ≥ 4.5`, (fg, bg) => {
      expect(contrastRatio(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
    });
  }

  it("конвертер OKLCH → HEX даёт ожидаемые значения", () => {
    expect(oklchToHex("oklch(1 0 0)")).toBe("#ffffff");
    expect(oklchToHex("oklch(0 0 0)")).toBe("#000000");
  });
});
