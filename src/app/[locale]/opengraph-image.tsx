import { ImageResponse } from "next/og";
import { THEMES } from "@/config/themes";
import { oklchToHex } from "@/lib/color";
import { isLocale } from "@/i18n/routing";
import { tr } from "@/lib/localized";
import { MarkSvg, ogFonts } from "@/lib/og";
import { getClinic } from "@/lib/settings";

export const alt = "Стоматология";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Картинка для соцсетей и мессенджеров: название, слоган и адрес клиники в цветах темы. */
export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const raw = (await params).locale;
  const locale = isLocale(raw) ? raw : "ru";
  const [clinic, fonts] = await Promise.all([getClinic(), ogFonts()]);
  const t = THEMES[clinic.theme].tokens;
  const c = (k: keyof typeof t) => oklchToHex(t[k]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: c("background"),
          fontFamily: "Onest",
          padding: 72,
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", right: -120, top: -120, width: 520, height: 520, borderRadius: 999, background: c("primary-soft"), display: "flex" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <MarkSvg size={72} bg={c("primary")} fg={c("primary-foreground")} />
            <span style={{ fontSize: 40, fontWeight: 700, color: c("ink") }}>{clinic.name}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
            <span style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05, color: c("ink"), letterSpacing: -2 }}>
              {tr(clinic.tagline, locale)}
            </span>
            <span style={{ marginTop: 24, fontSize: 30, color: c("muted-foreground") }}>{tr(clinic.address, locale)}</span>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ background: c("primary"), color: c("primary-foreground"), fontSize: 28, fontWeight: 700, padding: "16px 32px", borderRadius: 999 }}>
              {locale === "ky" ? "Онлайн жазылуу" : "Онлайн-запись"}
            </span>
            <span style={{ border: `2px solid ${c("border")}`, color: c("ink"), fontSize: 28, fontWeight: 500, padding: "14px 30px", borderRadius: 999 }}>
              {clinic.phones[0] ?? ""}
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
