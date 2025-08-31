"use client";

import React from "react";
import {
  Box,
  Paper,
  Stack,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Tooltip,
  Divider,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ReactMarkdown from "react-markdown";

type ChatRole = "user" | "assistant";
type ChatMessage = { id: string; role: ChatRole; text: string; createdAtIso: string };

type ChatSession = {
  id: string;
  title: string;
  createdAtIso: string;
  updatedAtIso: string;
  messages: ChatMessage[];
};

interface ChatAssistantProps {
  onAsk?: (promptText: string, history: ChatMessage[]) => Promise<string>;
}

const storageKey = "chatAssistant.sessions.v1";
const defaultSessionTitle = "New chat";
const maxSessionsToKeep = 50;

function nowIso() {
  return new Date().toISOString();
}
function generateId() {
  return Math.random().toString(36).slice(2);
}

function loadSessionsFromStorage(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as ChatSession[];
    return [];
  } catch {
    return [];
  }
}
function saveSessionsToStorage(sessions: ChatSession[]) {
  if (typeof window === "undefined") return;
  try {
    const trimmed = sessions.slice(0, maxSessionsToKeep);
    window.localStorage.setItem(storageKey, JSON.stringify(trimmed));
  } catch {}
}

function makeEmptySession(): ChatSession {
  const createdAtIso = nowIso();
  return {
    id: generateId(),
    title: defaultSessionTitle,
    createdAtIso,
    updatedAtIso: createdAtIso,
    messages: [],
  };
}

// Utility: debounce to avoid excessive writes
function useDebouncedEffect(effect: () => void, deps: React.DependencyList, delay = 250) {
  React.useEffect(() => {
    const h = setTimeout(effect, delay);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default function ChatAssistant({ onAsk }: ChatAssistantProps) {
  // ----- Sessions state -----
  const [chatSessions, setChatSessions] = React.useState<ChatSession[]>([makeEmptySession()]);
  const [currentSessionId, setCurrentSessionId] = React.useState<string>(() => chatSessions[0].id);
  const [isHydrated, setIsHydrated] = React.useState(false);

  const currentSession = React.useMemo(
    () => chatSessions.find((s) => s.id === currentSessionId) || chatSessions[0],
    [chatSessions, currentSessionId],
  );

  const [messages, setMessages] = React.useState<ChatMessage[]>(currentSession.messages);

  React.useEffect(() => {
    const existing = loadSessionsFromStorage();
    if (existing.length) {
      setChatSessions(existing);
      setCurrentSessionId(existing[0].id);
    }
    setIsHydrated(true);
  }, []);

  React.useEffect(() => {
    setMessages(currentSession.messages);
  }, [currentSessionId]);

  useDebouncedEffect(() => {
    saveSessionsToStorage(chatSessions);
  }, [chatSessions]);

  useDebouncedEffect(() => {
    setChatSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              messages,
              title:
                s.title === defaultSessionTitle && messages.length
                  ? messages.find((m) => m.role === "user")?.text.slice(0, 40) || s.title
                  : s.title,
              updatedAtIso: nowIso(),
            }
          : s,
      ),
    );
  }, [messages, currentSessionId]);

  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const [historyQueryText, setHistoryQueryText] = React.useState("");
  const filteredSessions = React.useMemo(() => {
    const q = historyQueryText.trim().toLowerCase();
    if (!q) return chatSessions;
    return chatSessions.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.messages.some((m) => m.text.toLowerCase().includes(q)),
    );
  }, [historyQueryText, chatSessions]);

  const [isRenameDialogOpen, setIsRenameDialogOpen] = React.useState(false);
  const [renameText, setRenameText] = React.useState("");

  function openRenameDialog(session: ChatSession) {
    setRenameText(session.title);
    setIsRenameDialogOpen(true);
  }
  function applyRename() {
    setChatSessions((prev) =>
      prev.map((s) => (s.id === currentSessionId ? { ...s, title: renameText } : s)),
    );
    setIsRenameDialogOpen(false);
  }

  function createNewChatSession() {
    const newSession = makeEmptySession();
    setChatSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
  }

  function deleteSession(sessionId: string) {
    setChatSessions((prev) => {
      const next = prev.filter((s) => s.id !== sessionId);
      if (!next.length) next.push(makeEmptySession());
      if (sessionId === currentSessionId) {
        setCurrentSessionId(next[0].id);
        setMessages(next[0].messages);
      }
      return next;
    });
  }

  // ----- Import / Export -----
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  function exportCurrentSessionAsJson() {
    const blob = new Blob([JSON.stringify(currentSession, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentSession.title || "chat"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importSessionFromFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        let sessionToAdd: ChatSession;
        if (Array.isArray(parsed)) {
          sessionToAdd = {
            id: generateId(),
            title: defaultSessionTitle,
            createdAtIso: nowIso(),
            updatedAtIso: nowIso(),
            messages: (parsed as any[]).map((m) => ({
              id: generateId(),
              role: (m.role === "assistant" ? "assistant" : "user") as ChatRole,
              text: String(m.text ?? ""),
              createdAtIso: m.createdAtIso || nowIso(),
            })),
          };
        } else {
          sessionToAdd = {
            id: generateId(),
            title: String(parsed.title || defaultSessionTitle),
            createdAtIso: parsed.createdAtIso || nowIso(),
            updatedAtIso: nowIso(),
            messages: Array.isArray(parsed.messages)
              ? parsed.messages.map((m: any) => ({
                  id: generateId(),
                  role: (m.role === "assistant" ? "assistant" : "user") as ChatRole,
                  text: String(m.text ?? ""),
                  createdAtIso: m.createdAtIso || nowIso(),
                }))
              : [],
          };
        }
        setChatSessions((prev) => [sessionToAdd, ...prev]);
        setCurrentSessionId(sessionToAdd.id);
        setMessages(sessionToAdd.messages);
      } catch (e) {
        alert("Could not import JSON. Make sure the file is a chat session or messages array.");
      }
    };
    reader.readAsText(file);
  }

  const [queryText, setQueryText] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const endRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const ask = async () => {
    const trimmed = queryText.trim();
    if (!trimmed || isTyping) return;

    const newUserMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      text: trimmed,
      createdAtIso: nowIso(),
    };
    setMessages((m) => [...m, newUserMessage]);
    setQueryText("");
    setIsTyping(true);

    try {
      let answer = "";
      if (onAsk) {
        answer = await onAsk(trimmed, [...messages, newUserMessage]);
      } else {
        await wait(600);
        answer =
          `**Here’s what I found:**\n\n` +
          `• Your question was: _${trimmed}_\n` +
          `• I render **bold**, *italics*, \`inline code\`, and lists.\n\n` +
          `> Tip: Open the history drawer to revisit and manage past chats.`;
      }

      const newAssistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        text: answer,
        createdAtIso: nowIso(),
      };
      setMessages((m) => [...m, newAssistantMessage]);
    } catch (err: any) {
      const errorAssistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        text: `Sorry — I could not process that.\n\n\`${err?.message || "Unknown error"}\``,
        createdAtIso: nowIso(),
      };
      setMessages((m) => [...m, errorAssistantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const onComposerKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask();
    }
  };

  // Delete a single message
  const removeMessage = (messageId: string) => {
    setMessages((m) => m.filter((msg) => msg.id !== messageId));
  };

  // Clear just the messages but keep the session
  const clearCurrentChat = () => {
    setMessages([]);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <SmartToyOutlinedIcon />
          <Typography variant="subtitle1">
            Chat Assistant
            {isHydrated && currentSession.title !== defaultSessionTitle
              ? ` · ${currentSession.title}`
              : ""}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Tooltip title="History">
            <IconButton aria-label="Open history" onClick={() => setIsHistoryOpen(true)}>
              <HistoryRoundedIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Export session as JSON">
            <IconButton aria-label="Export as JSON" onClick={exportCurrentSessionAsJson}>
              <FileDownloadOutlinedIcon />
            </IconButton>
          </Tooltip>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importSessionFromFile(f);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
          />
          <Tooltip title="Import session from JSON">
            <IconButton aria-label="Import JSON" onClick={() => fileInputRef.current?.click()}>
              <UploadFileOutlinedIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Clear current chat">
            <IconButton aria-label="Clear chat" onClick={clearCurrentChat}>
              <DeleteOutlineIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* Messages */}
      <Box
        sx={{
          maxHeight: 360,
          overflowY: "auto",
          pr: 1,
          pb: 1,
          borderRadius: 1,
        }}
      >
        <Stack spacing={1.5}>
          {messages.map((m) => (
            <Stack
              key={m.id}
              direction="row"
              alignItems="flex-start"
              spacing={1}
              sx={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "100%" }}
            >
              {m.role === "assistant" ? (
                <Avatar sx={{ bgcolor: "primary.main" }} aria-label="AI">
                  <SmartToyOutlinedIcon fontSize="small" />
                </Avatar>
              ) : (
                <Avatar sx={{ bgcolor: "grey.500" }} aria-label="You">
                  <PersonOutlineIcon fontSize="small" />
                </Avatar>
              )}

              <Paper
                elevation={0}
                className="chat-bubble"
                sx={{
                  p: 1.25,
                  bgcolor: m.role === "assistant" ? "action.hover" : "background.paper",
                  border: 1,
                  borderColor: "divider",
                  maxWidth: { xs: "80%", sm: "75%" },
                  position: "relative",
                  pr: 6,
                  "&:hover .messageAction, &:focus-within .messageAction": {
                    opacity: 1,
                    pointerEvents: "auto",
                  },
                }}
              >
                {m.role === "assistant" ? (
                  <Typography component="div" sx={{ "& p": { m: 0 } }}>
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </Typography>
                ) : (
                  <Typography whiteSpace="pre-wrap">{m.text}</Typography>
                )}

                {/* Per-message delete action */}
                <IconButton
                  className="messageAction"
                  aria-label="Delete message"
                  size="small"
                  onClick={() => removeMessage(m.id)}
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    opacity: 0,
                    pointerEvents: "none",
                    transition: "opacity .15s ease",
                    bgcolor: "background.paper",
                    boxShadow: 1,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Paper>
            </Stack>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ bgcolor: "primary.main" }} aria-label="AI typing">
                <SmartToyOutlinedIcon fontSize="small" />
              </Avatar>
              <Paper
                elevation={0}
                sx={{
                  p: 1.25,
                  border: 1,
                  borderColor: "divider",
                  bgcolor: "action.hover",
                }}
              >
                <Box aria-label="Assistant is typing" sx={{ display: "inline-flex", gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "text.secondary",
                      animation: "blink 1.4s infinite",
                    }}
                  />
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "text.secondary",
                      animation: "blink 1.4s infinite 0.2s",
                    }}
                  />
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "text.secondary",
                      animation: "blink 1.4s infinite 0.4s",
                    }}
                  />
                </Box>
              </Paper>
            </Stack>
          )}

          <div ref={endRef} />
        </Stack>
      </Box>

      {/* Composer */}
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <TextField
          fullWidth
          placeholder="Ask the assistant about your application…"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          onKeyDown={onComposerKeyDown}
          multiline
          minRows={1}
          maxRows={4}
        />
        <Tooltip title="Send">
          <span>
            <IconButton
              color="primary"
              onClick={ask}
              disabled={!queryText.trim() || isTyping}
              aria-label="Send message"
            >
              <SendRoundedIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <style jsx global>{`
        @keyframes blink {
          0% {
            opacity: 0.2;
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0.2;
          }
        }
      `}</style>

      {/* History Drawer */}
      <Drawer anchor="right" open={isHistoryOpen} onClose={() => setIsHistoryOpen(false)}>
        <Box
          sx={{
            width: { xs: 320, sm: 380 },
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">History</Typography>
            <Stack direction="row" spacing={1}>
              <Tooltip title="New chat">
                <IconButton onClick={createNewChatSession} aria-label="New chat">
                  <AddCircleOutlineIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Rename">
                <span>
                  <IconButton
                    onClick={() => openRenameDialog(currentSession)}
                    aria-label="Rename chat"
                    disabled={!currentSession}
                  >
                    <EditRoundedIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Close">
                <IconButton onClick={() => setIsHistoryOpen(false)} aria-label="Close history">
                  <CloseRoundedIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          <TextField
            placeholder="Search history…"
            value={historyQueryText}
            onChange={(e) => setHistoryQueryText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon />
                </InputAdornment>
              ),
            }}
          />

          <Divider />

          <List dense disablePadding sx={{ overflowY: "auto", flex: 1 }}>
            {filteredSessions.map((s) => {
              const last = s.messages[s.messages.length - 1];
              const preview =
                (last?.role ? (last.role === "assistant" ? "AI: " : "You: ") : "") +
                (last?.text ? last.text.slice(0, 50).replace(/\s+/g, " ") : " ");
              return (
                <ListItem
                  key={s.id}
                  disablePadding
                  secondaryAction={
                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        edge="end"
                        size="small"
                        aria-label="Rename"
                        onClick={() => {
                          setCurrentSessionId(s.id);
                          openRenameDialog(s);
                        }}
                      >
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        edge="end"
                        size="small"
                        aria-label="Delete session"
                        onClick={() => deleteSession(s.id)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  }
                >
                  <ListItemButton
                    selected={s.id === currentSessionId}
                    onClick={() => {
                      setCurrentSessionId(s.id);
                      setMessages(s.messages);
                    }}
                  >
                    <ListItemText
                      primary={s.title || defaultSessionTitle}
                      secondary={preview}
                      primaryTypographyProps={{ noWrap: true }}
                      secondaryTypographyProps={{ noWrap: true }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
            {!filteredSessions.length && (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  No matching chats.
                </Typography>
              </Box>
            )}
          </List>
        </Box>
      </Drawer>

      {/* Rename dialog */}
      <Dialog open={isRenameDialogOpen} onClose={() => setIsRenameDialogOpen(false)}>
        <DialogTitle>Rename chat</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            value={renameText}
            onChange={(e) => setRenameText(e.target.value)}
            placeholder="Enter a chat title"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRenameDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={applyRename} disabled={!renameText.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
