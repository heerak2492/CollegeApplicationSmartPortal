"use client";

import * as React from "react";
import { Box } from "@mui/material";

export default function AppLogo({
  size = 41,
  title = "College Application Smart Portal",
}: {
  size?: number;
  title?: string;
}) {
  return (
    <Box
      component="img"
      src="/logo-mark.svg"
      alt={title}
      width={size}
      height={size}
      sx={{ display: "inline-block", verticalAlign: "middle" }}
    />
  );
}
