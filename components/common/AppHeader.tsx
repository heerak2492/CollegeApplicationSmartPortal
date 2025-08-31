"use client";

import React from "react";
import { AppBar, Toolbar, Typography, IconButton, Box, Button, Tooltip } from "@mui/material";
import Link from "next/link";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { ColorModeContext } from "@/features/theme/ThemeProvider";
import AppLogo from "../AppLogo";

export default function AppHeader() {
  const colorModeContext = React.useContext(ColorModeContext);
  if (!colorModeContext) return null;
  const isDarkMode = colorModeContext.colorMode === "dark";

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, display: "flex", alignItems: "center", gap: 1 }}
        >
          <AppLogo />
          <span>College Application Smart Portal</span>
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button color="inherit" component={Link} href="/">
            Home
          </Button>
          <Button color="inherit" component={Link} href="/student">
            Student
          </Button>
          <Button color="inherit" component={Link} href="/faculty">
            Faculty
          </Button>

          <Tooltip title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}>
            <IconButton
              color="inherit"
              aria-label="Toggle color mode"
              onClick={colorModeContext.toggleColorMode}
            >
              {isDarkMode ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
