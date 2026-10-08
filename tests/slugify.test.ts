import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slugify";

describe("slugify", () => {
  it("транслитерирует русский и кыргызский", () => {
    expect(slugify("Имплантация зуба")).toBe("implantaciya-zuba");
    expect(slugify("Тимур Алиев")).toBe("timur-aliev");
    expect(slugify("Өмүр Ңазарова")).toBe("omur-nazarova");
    expect(slugify("  Отбеливание ZOOM 4! ")).toBe("otbelivanie-zoom-4");
  });
});
