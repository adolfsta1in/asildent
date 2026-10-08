import { ImageResponse } from "next/og";
import { THEMES } from "@/config/themes";
import { oklchToHex } from "@/lib/color";
import { MarkSvg } from "@/lib/og";
import { getClinic } from "@/lib/settings";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon в цвете выбранной темы — меняется вместе с темой в админке. */
export default async function Icon() {
  const clinic = await getClinic();
  const t = THEMES[clinic.theme].tokens;
  return new ImageResponse(<MarkSvg size={64} bg={oklchToHex(t.primary)} fg={oklchToHex(t["primary-foreground"])} />, size);
}
