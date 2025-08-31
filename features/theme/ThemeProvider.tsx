"use client";

import * as React from "react";
import { CssBaseline, PaletteMode, ThemeProvider } from "@mui/material";
import { buildTheme } from "./theme";

type ColorModeContextValue = {
  colorMode: PaletteMode;
  setColorMode: (m: PaletteMode) => void;
  toggleColorMode: () => void;
};

export const ColorModeContext = React.createContext<ColorModeContextValue | null>(null);
const storageKey = "preferred-color-scheme";

export default function AppThemeProvider({ children }: { children: React.ReactNode }) {
  // SSR-safe: start light, then hydrate to saved or system preference
  const [mounted, setMounted] = React.useState(false);
  const [mode, setMode] = React.useState<PaletteMode>("light");

  React.useEffect(() => {
    try {
      const saved = (localStorage.getItem(storageKey) as PaletteMode | null) ?? null;
      if (saved === "light" || saved === "dark") {
        setMode(saved);
      } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setMode("dark");
      } else {
        setMode("light");
      }
    } catch {
      setMode("light");
    }
    setMounted(true);
  }, []);

  const value = React.useMemo(
    () => ({
      colorMode: mode,
      setColorMode: (m: PaletteMode) => {
        setMode(m);
        try {
          localStorage.setItem(storageKey, m);
        } catch {}
      },
      toggleColorMode: () => {
        setMode((prev) => {
          const next = prev === "light" ? "dark" : "light";
          try {
            localStorage.setItem(storageKey, next);
          } catch {}
          return next;
        });
      },
    }),
    [mode],
  );

  // Rebuild theme whenever mode changes
  const theme = React.useMemo(() => buildTheme(mode), [mode]);

  // Avoid color flicker/hydration mismatch
  if (!mounted) return <div style={{ visibility: "hidden" }}>{children}</div>;

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        {/* enableColorScheme makes browser widgets match theme */}
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
