import { describe, expect, it } from "vitest";
import { branchIdFromUrl, pickFiveStar, shortName, type TwoGisReview } from "@/lib/reviews/twogis";

const long = "Очень довольна клиникой, врач всё подробно объяснил и вылечил без боли.";
const review = (over: Partial<TwoGisReview>): TwoGisReview => ({
  id: "1",
  rating: 5,
  text: long,
  date_created: "2026-08-12T10:00:00+06:00",
  user: { name: "Мека Умарова" },
  ...over,
});

describe("2GIS reviews", () => {
  it("сокращает фамилию до инициала", () => {
    expect(shortName("Мека Умарова")).toBe("Мека У.");
    expect(shortName("beams marlen")).toBe("Beams M.");
    expect(shortName("Аяр 52")).toBe("Аяр");
    expect(shortName("Tabi .")).toBe("Tabi");
    expect(shortName("  ")).toBe("Пациент");
    expect(shortName("ЯСМИНА")).toBe("Ясмина");
    expect(shortName("NN Б")).toBe("NN Б.");
  });

  it("берёт только видимые отзывы на 5 звёзд с текстом", () => {
    const picked = pickFiveStar([
      review({ id: "a" }),
      review({ id: "b", rating: 4 }),
      review({ id: "c", rating: 1 }),
      review({ id: "d", text: "Супер!" }),
      review({ id: "e", text: null }),
      review({ id: "f", is_hidden: true }),
      review({ id: "g", on_moderation: true }),
    ]);
    expect(picked.map((r) => r.externalId)).toEqual(["a"]);
    expect(picked[0]).toMatchObject({ authorName: "Мека У.", text: long, rating: 5 });
    expect(picked[0].publishedAt.toISOString()).toBe("2026-08-12T04:00:00.000Z");
  });

  it("достаёт id филиала из ссылки", () => {
    expect(branchIdFromUrl("https://2gis.kg/bishkek/firm/70000001080121049")).toBe("70000001080121049");
    expect(branchIdFromUrl("https://2gis.kg/bishkek")).toBeNull();
  });
});
