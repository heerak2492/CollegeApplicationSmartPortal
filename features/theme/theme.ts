// features/theme/theme.ts
import { createTheme, PaletteMode, ThemeOptions } from "@mui/material";

export const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          background: { default: "#f7f8fb", paper: "#ffffff" },
        }
      : {
          background: { default: "#0b1020", paper: "#11162a" },
        }),
    primary: { main: mode === "light" ? "#3f51b5" : "#90caf9" },
    secondary: { main: mode === "light" ? "#f50057" : "#f48fb1" },
  },
  shape: { borderRadius: 12 },
  typography: { fontSize: 14 },
  components: {
    MuiPaper: { styleOverrides: { root: { transition: "background-color .2s ease" } } },
    MuiAppBar: { styleOverrides: { root: { transition: "background-color .2s ease" } } },
  },
});

export const buildTheme = (mode: PaletteMode) => createTheme(getDesignTokens(mode));
