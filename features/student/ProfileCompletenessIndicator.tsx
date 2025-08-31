// features/student/ProfileCompletenessIndicator.tsx
"use client";

import * as React from "react";
import { LinearProgress, Stack, Typography } from "@mui/material";

export default function ProfileCompletenessIndicator({
  percentComplete,
}: {
  percentComplete: number;
}) {
  // Capture the server-rendered value so the first client render matches exactly.
  const initialPercentRef = React.useRef(Math.max(0, Math.min(100, Math.round(percentComplete))));
  const [displayPercent, setDisplayPercent] = React.useState(initialPercentRef.current);

  // After hydration, update to the latest value computed from client state/localStorage.
  React.useEffect(() => {
    const clamped = Math.max(0, Math.min(100, Math.round(percentComplete)));
    setDisplayPercent(clamped);
  }, [percentComplete]);

  return (
    <Stack spacing={0.5} aria-label="profile completeness">
      <Typography variant="body2">
        Profile completeness: <span>{displayPercent}</span>%
      </Typography>
      <LinearProgress variant="determinate" value={displayPercent} />
    </Stack>
  );
}
