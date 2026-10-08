import { formatNumber } from "./format";

type PriceT = (key: "priceFrom" | "priceRange", values: Record<string, string>) => string;

/** «от 3 500 сом» / «3 500 – 6 000 сом» с переводом. */
export function priceLabel(t: PriceT, priceFrom: number, priceTo?: number | null, mode: "from" | "range" = "from") {
  if (mode === "range" && priceTo && priceTo > priceFrom) {
    return t("priceRange", { from: formatNumber(priceFrom), to: formatNumber(priceTo) });
  }
  return t("priceFrom", { price: formatNumber(priceFrom) });
}

// Год фиксируется при старте сервера/сборке: так страницы остаются статическими.
const CURRENT_YEAR = new Date().getFullYear();

export function yearsSince(year: number) {
  return Math.max(1, CURRENT_YEAR - year);
}
