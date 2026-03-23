import type { CSSProperties } from "react";
import type { AppThemeId } from "@/services/persistence/app-settings";

export const themePresets = {
  warm: {
    surface: {
      app: "#F6F1EA",
      sidebar: "#EFE7DA",
      paper: "#FFFFFF",
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
  },
  ink: {
    surface: {
      app: "#F2F3F5",
      sidebar: "#E7EAEE",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#18202A",
      secondary: "#2D3745",
      muted: "#647182",
    },
    border: {
      soft: "#D3DAE4",
    },
    accent: {
      gold: "#5277A7",
      ink: "#0E1622",
    },
  },
  forest: {
    surface: {
      app: "#F2F4EF",
      sidebar: "#E5EADF",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1C241B",
      secondary: "#334032",
      muted: "#667064",
    },
    border: {
      soft: "#D2DACD",
    },
    accent: {
      gold: "#6F8C59",
      ink: "#162013",
    },
  },
} as const;

export const themeTokens = themePresets.warm;

export function getThemeTokens(themeId: AppThemeId) {
  return themePresets[themeId] ?? themePresets.warm;
}

export function getThemeVariables(themeId: AppThemeId): CSSProperties {
  const tokens = getThemeTokens(themeId);
  return {
    ["--color-surface-app" as string]: tokens.surface.app,
    ["--color-surface-sidebar" as string]: tokens.surface.sidebar,
    ["--color-surface-paper" as string]: tokens.surface.paper,
    ["--color-text-primary" as string]: tokens.text.primary,
    ["--color-text-secondary" as string]: tokens.text.secondary,
    ["--color-text-muted" as string]: tokens.text.muted,
    ["--color-border-soft" as string]: tokens.border.soft,
    ["--color-accent-gold" as string]: tokens.accent.gold,
    ["--color-ink-strong" as string]: tokens.accent.ink,
  };
}

export const themeOptions: Array<{ id: AppThemeId; label: string; summary: string }> = [
  { id: "warm", label: "暖米白", summary: "更接近纸张质感，适合正式文书阅读。" },
  { id: "ink", label: "冷灰墨", summary: "更冷静克制，适合长时间工作。" },
  { id: "forest", label: "浅林灰", summary: "更柔和安静，适合资料密集场景。" },
];

export const themeVariables: CSSProperties = getThemeVariables("warm");
