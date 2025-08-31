import * as React from "react";
import { render as rtlRender, RenderOptions } from "@testing-library/react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

type AllTheProvidersProps = { children: React.ReactNode };

function AllTheProviders({ children }: AllTheProvidersProps) {
  const theme = createTheme({ palette: { mode: "light" } });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDayjs}>{children}</LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export * from "@testing-library/react";

export function render(ui: React.ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return rtlRender(ui, { wrapper: AllTheProviders, ...options });
}
