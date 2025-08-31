"use client";

import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import {
  Paper,
  Stack,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  IconButton,
  Link as MuiLink,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useDropzone } from "react-dropzone";

type UploadStatus = "queued" | "uploading" | "done" | "error";

type UploadItem = {
  id: string;
  file: File;
  status: UploadStatus;
  url?: string;
  errorMessage?: string;
};

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export default function DocumentUpload({
  onUploaded,
}: {
  onUploaded?: (fileUrls: string[]) => void;
}) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const onDropAccepted = useCallback((acceptedFiles: File[]) => {
    const added: UploadItem[] = acceptedFiles.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      status: "queued",
    }));
    setItems((prev) => [...prev, ...added]);
    added.forEach((it) => startUpload(it));
  }, []);

  const onDropRejected = useCallback((fileRejections: any[]) => {
    const msg = fileRejections
      .map((r) => `${r.file?.name || "File"}: ${r.errors?.map((e: any) => e.message).join(", ")}`)
      .join(" • ");
    setSnackbar({ open: true, message: msg || "Some files were rejected.", severity: "error" });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
    maxSize: MAX_BYTES,
    onDropAccepted,
    onDropRejected,
  });

  const startUpload = async (item: UploadItem) => {
    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, status: "uploading" } : it)));
    try {
      const formData = new FormData();
      formData.append("file", item.file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        const errorMessage = data?.error || "Upload failed. Try again.";
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: "error", errorMessage } : it)),
        );
        setSnackbar({ open: true, message: errorMessage, severity: "error" });
        return;
      }

      const url = (data.fileUrls && data.fileUrls[0]) || "";
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: "done", url } : it)),
      );
      setSnackbar({ open: true, message: `${item.file.name} uploaded`, severity: "success" });

      if (onUploaded && url) onUploaded([url]);
    } catch (e: any) {
      const errorMessage = e?.message || "Upload failed. Try again.";
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: "error", errorMessage } : it)),
      );
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    }
  };

  const clearAll = () => setItems([]);

  const dropStyles = useMemo(
    () => ({
      cursor: "pointer",
      border: "2px dashed",
      borderColor: isDragActive ? "primary.main" : "divider",
      bgcolor: isDragActive ? "action.hover" : "background.paper",
      transition: "background-color 120ms ease",
      p: 3,
      borderRadius: 2,
      textAlign: "center" as const,
    }),
    [isDragActive],
  );

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Upload transcript or certificate (PDF)</Typography>
          <Tooltip title="Clear list">
            <span>
              <IconButton aria-label="clear files" onClick={clearAll} disabled={items.length === 0}>
                <DeleteOutlineIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {/* Drag-and-drop area */}
        <div {...getRootProps()} aria-label="file drop area">
          <input {...getInputProps()} />
          <Paper elevation={0} sx={dropStyles}>
            <CloudUploadIcon fontSize="large" />
            <Typography variant="body1" mt={1}>
              {isDragActive
                ? "Drop the PDF files here…"
                : "Drag & drop PDF files here, or click to browse"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Only .pdf up to 10MB each
            </Typography>
          </Paper>
        </div>

        {/* File list */}
        {items.length > 0 && (
          <List dense sx={{ width: "100%" }}>
            {items.map((it) => (
              <ListItem key={it.id} disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <InsertDriveFileIcon />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                      <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                        {it.file.name}
                      </Typography>
                      {it.url && (
                        <MuiLink href={it.url} target="_blank" rel="noopener">
                          View
                        </MuiLink>
                      )}
                    </Stack>
                  }
                  secondary={
                    <>
                      {it.status === "uploading" && (
                        <Stack spacing={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            Uploading…
                          </Typography>
                          <LinearProgress />
                        </Stack>
                      )}
                      {it.status === "queued" && (
                        <Typography variant="caption" color="text.secondary">
                          Queued — uploading will start automatically
                        </Typography>
                      )}
                      {it.status === "done" && (
                        <Typography variant="caption" color="success.main">
                          Uploaded successfully
                        </Typography>
                      )}
                      {it.status === "error" && (
                        <Typography variant="caption" color="error.main">
                          {it.errorMessage || "Upload failed"}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}

        {/* Fallback browse button */}
        <div>
          <Button
            variant="outlined"
            onClick={() => {
              const input = document.querySelector<HTMLInputElement>('input[type="file"]');
              input?.click();
            }}
            startIcon={<CloudUploadIcon />}
          >
            Browse PDFs
          </Button>
        </div>
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
