/**
 * Цветовые темы сайта. Каждая тема — набор CSS-переменных (OKLCH).
 * Активная тема выбирается в админке (Настройки → Тема) и подставляется в <html> при рендере.
 * Чтобы добавить тему — добавьте объект в THEMES и её id в THEME_IDS.
 */
export const THEME_IDS = ["asil", "mint", "blue", "sand"] as const;
export type ThemeId = (typeof THEME_IDS)[number];

type ThemeTokens = Record<
  | "background"
  | "foreground"
  | "card"
  | "surface"
  | "primary"
  | "primary-hover"
  | "primary-foreground"
  | "primary-soft"
  | "primary-soft-foreground"
  | "secondary"
  | "secondary-foreground"
  | "muted"
  | "muted-foreground"
  | "accent"
  | "accent-foreground"
  | "border"
  | "input"
  | "ring"
  | "ink",
  string
>;

export type Theme = {
  id: ThemeId;
  label: string;
  description: string;
  /** Цвета для превью-«образцов» в админке. */
  swatches: [string, string, string];
  tokens: ThemeTokens;
};

export const THEMES: Record<ThemeId, Theme> = {
  asil: {
    id: "asil",
    label: "AsilDent",
    description: "Фирменный голубой AsilDent — как на вывеске и в логотипе клиники",
    swatches: ["oklch(0.5 0.12 240)", "oklch(0.94 0.03 232)", "oklch(0.24 0.04 245)"],
    tokens: {
      background: "oklch(0.988 0.004 232)",
      foreground: "oklch(0.24 0.03 245)",
      card: "oklch(1 0 0)",
      surface: "oklch(0.963 0.013 232)",
      primary: "oklch(0.5 0.12 240)",
      "primary-hover": "oklch(0.45 0.115 242)",
      "primary-foreground": "oklch(0.99 0.004 232)",
      "primary-soft": "oklch(0.94 0.03 232)",
      "primary-soft-foreground": "oklch(0.38 0.09 242)",
      secondary: "oklch(0.952 0.012 232)",
      "secondary-foreground": "oklch(0.28 0.035 245)",
      muted: "oklch(0.958 0.008 232)",
      "muted-foreground": "oklch(0.47 0.025 240)",
      accent: "oklch(0.93 0.04 205)",
      "accent-foreground": "oklch(0.36 0.07 220)",
      border: "oklch(0.905 0.014 232)",
      input: "oklch(0.875 0.018 232)",
      ring: "oklch(0.6 0.11 240)",
      ink: "oklch(0.22 0.04 245)",
    },
  },
  mint: {
    id: "mint",
    label: "Мятная",
    description: "Свежая, лёгкая, «чистая» — классика современной стоматологии",
    swatches: ["oklch(0.52 0.095 180)", "oklch(0.95 0.03 175)", "oklch(0.25 0.03 200)"],
    tokens: {
      background: "oklch(0.988 0.004 170)",
      foreground: "oklch(0.24 0.025 210)",
      card: "oklch(1 0 0)",
      surface: "oklch(0.965 0.014 172)",
      primary: "oklch(0.52 0.095 180)",
      "primary-hover": "oklch(0.47 0.09 182)",
      "primary-foreground": "oklch(0.99 0.005 170)",
      "primary-soft": "oklch(0.94 0.035 172)",
      "primary-soft-foreground": "oklch(0.36 0.07 185)",
      secondary: "oklch(0.955 0.012 175)",
      "secondary-foreground": "oklch(0.28 0.03 205)",
      muted: "oklch(0.96 0.008 175)",
      "muted-foreground": "oklch(0.47 0.02 205)",
      accent: "oklch(0.93 0.04 85)",
      "accent-foreground": "oklch(0.35 0.06 65)",
      border: "oklch(0.91 0.012 180)",
      input: "oklch(0.88 0.015 180)",
      ring: "oklch(0.6 0.1 180)",
      ink: "oklch(0.22 0.03 210)",
    },
  },
  blue: {
    id: "blue",
    label: "Синяя",
    description: "Строгая, «клиническая», вызывает ощущение надёжности",
    swatches: ["oklch(0.47 0.15 258)", "oklch(0.95 0.025 250)", "oklch(0.24 0.05 262)"],
    tokens: {
      background: "oklch(0.988 0.004 250)",
      foreground: "oklch(0.24 0.035 262)",
      card: "oklch(1 0 0)",
      surface: "oklch(0.963 0.013 250)",
      primary: "oklch(0.47 0.15 258)",
      "primary-hover": "oklch(0.42 0.145 260)",
      "primary-foreground": "oklch(0.99 0.004 250)",
      "primary-soft": "oklch(0.935 0.035 252)",
      "primary-soft-foreground": "oklch(0.37 0.12 260)",
      secondary: "oklch(0.952 0.012 250)",
      "secondary-foreground": "oklch(0.28 0.04 262)",
      muted: "oklch(0.958 0.008 250)",
      "muted-foreground": "oklch(0.47 0.03 260)",
      accent: "oklch(0.93 0.045 210)",
      "accent-foreground": "oklch(0.36 0.07 225)",
      border: "oklch(0.905 0.014 252)",
      input: "oklch(0.875 0.018 252)",
      ring: "oklch(0.58 0.14 258)",
      ink: "oklch(0.21 0.045 264)",
    },
  },
  sand: {
    id: "sand",
    label: "Тёплая бежевая",
    description: "Уютная, «премиальная», как в бутик-клинике",
    swatches: ["oklch(0.52 0.11 45)", "oklch(0.95 0.025 75)", "oklch(0.27 0.03 50)"],
    tokens: {
      background: "oklch(0.985 0.008 80)",
      foreground: "oklch(0.26 0.025 50)",
      card: "oklch(0.998 0.003 80)",
      surface: "oklch(0.958 0.018 78)",
      primary: "oklch(0.52 0.11 45)",
      "primary-hover": "oklch(0.47 0.105 43)",
      "primary-foreground": "oklch(0.99 0.006 80)",
      "primary-soft": "oklch(0.93 0.035 60)",
      "primary-soft-foreground": "oklch(0.4 0.09 45)",
      secondary: "oklch(0.948 0.016 78)",
      "secondary-foreground": "oklch(0.3 0.03 50)",
      muted: "oklch(0.955 0.012 78)",
      "muted-foreground": "oklch(0.48 0.025 55)",
      accent: "oklch(0.93 0.035 150)",
      "accent-foreground": "oklch(0.37 0.06 155)",
      border: "oklch(0.9 0.018 75)",
      input: "oklch(0.87 0.022 75)",
      ring: "oklch(0.6 0.11 45)",
      ink: "oklch(0.24 0.03 45)",
    },
  },
};

export function isThemeId(value: string): value is ThemeId {
  return (THEME_IDS as readonly string[]).includes(value);
}

/** CSS-блок с переменными темы для подстановки в <style>. */
export function themeToCss(id: ThemeId): string {
  const { tokens } = THEMES[id] ?? THEMES.mint;
  const vars = Object.entries(tokens)
    .map(([k, v]) => `--${k}:${v};`)
    .join("");
  return `:root{${vars}}`;
}
