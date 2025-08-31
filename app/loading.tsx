"use client";

import { Box, CircularProgress, Paper, Typography } from "@mui/material";

export default function Loading() {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper elevation={0} sx={{ display: "flex", alignItems: "center", gap: 2, p: 3 }}>
        <CircularProgress size={28} />
        <Typography>Loading the page…</Typography>
      </Paper>
    </Box>
  );
}
