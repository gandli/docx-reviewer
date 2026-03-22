import type { PropsWithChildren } from "react";
import { themeTokens, themeVariables } from "@/shared/constants/theme";

export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <div
      style={themeVariables}
      data-surface-paper={themeTokens.surface.paper}
      data-surface-sidebar={themeTokens.surface.sidebar}
    >
      {children}
    </div>
  );
}
