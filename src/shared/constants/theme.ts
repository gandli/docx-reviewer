import type { CSSProperties } from "react";

export const themeTokens = {
  surface: {
    app: "#F6F1EA",
    sidebar: "#EFE7DA",
    paper: "#FBF8F2",
  },
  text: {
    primary: "#1F1A14",
    secondary: "#3D352C",
    muted: "#6D6457",
  },
  border: {
    soft: "#D8CFC1",
  },
  accent: {
    gold: "#B58E53",
    ink: "#16130F",
  },
} as const;

export const themeVariables: CSSProperties = {
  ["--color-surface-app" as string]: themeTokens.surface.app,
  ["--color-surface-sidebar" as string]: themeTokens.surface.sidebar,
  ["--color-surface-paper" as string]: themeTokens.surface.paper,
  ["--color-text-primary" as string]: themeTokens.text.primary,
  ["--color-text-secondary" as string]: themeTokens.text.secondary,
  ["--color-text-muted" as string]: themeTokens.text.muted,
  ["--color-border-soft" as string]: themeTokens.border.soft,
  ["--color-accent-gold" as string]: themeTokens.accent.gold,
  ["--color-ink-strong" as string]: themeTokens.accent.ink,
};
