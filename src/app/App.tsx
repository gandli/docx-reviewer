import { RuntimeProvider } from "@/app/providers/runtime-provider";
import { ThemeProvider } from "@/app/providers/theme-provider";
import { AppRouter } from "@/app/router";

export function App() {
  return (
    <ThemeProvider>
      <RuntimeProvider>
        <AppRouter />
      </RuntimeProvider>
    </ThemeProvider>
  );
}
