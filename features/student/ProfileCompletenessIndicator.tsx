"use client";

import * as React from "react";
import { LinearProgress, Stack, Typography } from "@mui/material";

export default function ProfileCompletenessIndicator({
  percentComplete,
}: {
  percentComplete: number;
}) {
  const initialPercentRef = React.useRef(Math.max(0, Math.min(100, Math.round(percentComplete))));
  const [displayPercent, setDisplayPercent] = React.useState(initialPercentRef.current);

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
