import { useSyncExternalStore, type PropsWithChildren } from "react";
import {
  getDefaultAppSettings,
  getAppSettingsSnapshot,
  subscribeAppSettings,
} from "@/services/persistence/app-settings";
import { getThemeTokens, getThemeVariables } from "@/shared/constants/theme";

export function ThemeProvider({ children }: PropsWithChildren) {
  const appSettings = useSyncExternalStore(
    subscribeAppSettings,
    getAppSettingsSnapshot,
    getDefaultAppSettings,
  );
  const themeTokens = getThemeTokens(appSettings.themeId);

  return (
    <div
      style={getThemeVariables(appSettings.themeId)}
      data-surface-paper={themeTokens.surface.paper}
      data-surface-sidebar={themeTokens.surface.sidebar}
      data-theme-id={appSettings.themeId}
    >
      {children}
    </div>
  );
}
