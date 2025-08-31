"use client";
import * as React from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { useMemo, useState } from "react";

export const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

export default function MUIThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("light");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prev) => (prev === "light" ? "dark" : "light"));
      }
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode
        },
        shape: { borderRadius: 12 },
        typography: {
          fontFamily: "'Inter', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
        }
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
