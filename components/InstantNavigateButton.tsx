"use client";

import * as React from "react";
import { Button, Backdrop, CircularProgress, Stack, Typography, ButtonProps } from "@mui/material";
import { useRouter } from "next/navigation";

type InstantNavigateButtonProps = ButtonProps & {
  href: string;
  loadingLabel?: string;
};

export default function InstantNavigateButton({
  href,
  loadingLabel = "Loading…",
  onClick,
  children,
  ...buttonProps
}: InstantNavigateButtonProps) {
  const router = useRouter();
  const [isOverlayOpen, setIsOverlayOpen] = React.useState(false);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (eventObject) => {
    onClick?.(eventObject);
    // show overlay immediately, then navigate
    setIsOverlayOpen(true);
    // yield to paint, then push
    React.startTransition(() => {
      router.push(href);
    });
  };

  return (
    <>
      <Button onClick={handleClick} fullWidth {...buttonProps}>
        {children}
      </Button>
      {isOverlayOpen && (
        <Backdrop open sx={{ zIndex: (t) => t.zIndex.modal + 1 }}>
          <Stack alignItems="center" spacing={2}>
            <CircularProgress />
            <Typography variant="body2">{loadingLabel}</Typography>
          </Stack>
        </Backdrop>
      )}
    </>
  );
}
