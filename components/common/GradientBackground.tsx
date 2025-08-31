// components/common/GradientBackground.tsx
"use client";

import * as React from "react";
import { Box, useTheme } from "@mui/material";

export default function GradientBackground({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const backgroundImage = isDark
    ? "linear-gradient(135deg, rgba(16,16,24,1) 0%, rgba(34,34,46,1) 50%, rgba(18,22,28,1) 100%)"
    : "linear-gradient(135deg, rgba(245,247,250,1) 0%, rgba(236,241,255,1) 50%, rgba(250,251,254,1) 100%)";

  return (
    <Box sx={{ minHeight: "100vh", backgroundImage, backgroundAttachment: "fixed" }}>
      {children}
    </Box>
  );
}
