"use client";

import * as React from "react";
import { TextField, InputAdornment, IconButton, Tooltip } from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

export interface FacultySearchBarProps {
  searchQueryText: string;
  onSearchQueryTextChange: (nextValue: string) => void;
  onSearchSubmit?: () => void; // optional: fire when user presses Enter
  autoFocus?: boolean;
  placeholderText?: string;
}

export default function FacultySearchBar({
  searchQueryText,
  onSearchQueryTextChange,
  onSearchSubmit,
  autoFocus = false,
  placeholderText = "Search applications…",
}: FacultySearchBarProps) {
  const inputReference = React.useRef<HTMLInputElement | null>(null);

  const clearSearch = () => {
    onSearchQueryTextChange("");
    // keep focus in the input after clearing
    requestAnimationFrame(() => inputReference.current?.focus());
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (eventObject) => {
    if (eventObject.key === "Escape") {
      eventObject.preventDefault();
      clearSearch();
    }
    if (eventObject.key === "Enter" && onSearchSubmit) {
      onSearchSubmit();
    }
  };

  return (
    <TextField
      inputRef={inputReference}
      label="Search"
      value={searchQueryText}
      onChange={(e) => onSearchQueryTextChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholderText}
      variant="outlined"
      size="small"
      fullWidth
      autoFocus={autoFocus}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchOutlinedIcon aria-hidden />
          </InputAdornment>
        ),
        endAdornment: searchQueryText ? (
          <InputAdornment position="end">
            <Tooltip title="Clear search">
              <IconButton aria-label="Clear search" edge="end" onClick={clearSearch} size="small">
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </InputAdornment>
        ) : undefined,
        inputProps: {
          "aria-label": "Search applications",
        },
      }}
    />
  );
}
