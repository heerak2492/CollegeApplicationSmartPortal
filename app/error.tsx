"use client";
import { Alert, AlertTitle, Button, Stack } from "@mui/material";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <Stack spacing={2} mt={4}>
      <Alert severity="error" variant="outlined">
        <AlertTitle>Something went wrong</AlertTitle>
        {error.message}
      </Alert>
      <Button onClick={reset} variant="contained">Try Again</Button>
    </Stack>
  );
}
