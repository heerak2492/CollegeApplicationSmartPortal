// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import AppProviders from "./providers";
import AppHeader from "@/components/common/AppHeader";
import GradientBackground from "@/components/common/GradientBackground";
import { Container, Box } from "@mui/material";
import AppThemeProvider from "@/features/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "College Application Smart Portal",
  description: "Student portal with AI assistant and faculty review portal.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <GradientBackground>
            <AppThemeProvider>
              <AppHeader />
              <Container maxWidth="lg">
                <Box py={3}>{children}</Box>
              </Container>
            </AppThemeProvider>
          </GradientBackground>
        </AppProviders>
      </body>
    </html>
  );
}
