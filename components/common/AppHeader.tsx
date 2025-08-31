"use client";
import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button
} from "@mui/material";
import Link from "next/link";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { ColorModeContext } from "@/app/theme";

export default function AppHeader() {
  const colorMode = React.useContext(ColorModeContext);
  const [isDark, setIsDark] = React.useState(false);

  const handleToggle = () => {
    setIsDark((prev) => !prev);
    colorMode.toggleColorMode();
  };

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          College Application Smart Portal
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button color="inherit" component={Link} href="/">Home</Button>
          <Button color="inherit" component={Link} href="/student">Student</Button>
          <Button color="inherit" component={Link} href="/faculty">Faculty</Button>
          <IconButton color="inherit" aria-label="toggle dark mode" onClick={handleToggle}>
            {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
