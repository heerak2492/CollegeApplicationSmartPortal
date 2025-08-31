"use client";

import * as React from "react";
import { Paper, Stack, Typography, LinearProgress, TextField } from "@mui/material";
import { getLocalStorageItem, setLocalStorageItem } from "@/lib/local-storage";

const PROGRESS_KEY = "student_video_progress_percent";
const NOTES_KEY = "student_video_notes";

export default function VideoTutorial() {
  const initialPercentRef = React.useRef<number>(0);
  const [watchedPercent, setWatchedPercent] = React.useState<number>(initialPercentRef.current);
  const [notesText, setNotesText] = React.useState<string>("");

  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  // After mount, hydrate from localStorage and start tracking progress.
  React.useEffect(() => {
    const savedPercent = getLocalStorageItem<number>(PROGRESS_KEY, 0);
    setWatchedPercent(Math.max(0, Math.min(100, Math.round(Number(savedPercent) || 0))));
    const savedNotes = getLocalStorageItem<string>(NOTES_KEY, "");
    setNotesText(savedNotes);

    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (!video.duration || Number.isNaN(video.duration)) return;
      const percent = Math.max(
        0,
        Math.min(100, Math.round((video.currentTime / video.duration) * 100)),
      );
      setWatchedPercent(percent);
      setLocalStorageItem(PROGRESS_KEY, percent);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

  return (
    <Paper sx={{ p: 2 }} variant="outlined">
      <Stack spacing={1.5}>
        <Typography variant="h6">Video Tutorial</Typography>
        <Typography variant="body2" color="text.secondary">
          Progress tracking, transcript and notes
        </Typography>

        <video
          ref={videoRef}
          controls
          style={{ width: "100%", borderRadius: 8 }}
          src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
        />

        <Stack spacing={0.5}>
          <Typography variant="body2">Watched: {watchedPercent}%</Typography>
          <LinearProgress variant="determinate" value={watchedPercent} />
        </Stack>

        <div>
          <Typography variant="subtitle1" gutterBottom>
            Transcript
          </Typography>
          <Typography variant="body2" component="div">
            <ol style={{ margin: 0, paddingLeft: "1.25rem" }}>
              <li>Welcome to the portal.</li>
              <li>Learn how to fill your application.</li>
              <li>How to upload documents.</li>
              <li>Saving and previewing your draft.</li>
            </ol>
          </Typography>
        </div>

        <div>
          <Typography variant="subtitle1" gutterBottom>
            Notes
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder="Write your notes here…"
            value={notesText}
            onChange={(e) => {
              setNotesText(e.target.value);
              setLocalStorageItem(NOTES_KEY, e.target.value);
            }}
          />
        </div>
      </Stack>
    </Paper>
  );
}
