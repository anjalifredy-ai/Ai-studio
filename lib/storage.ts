// lib/storage.ts
// Simple localStorage-backed persistence for chat sessions.
// No backend DB needed — works instantly on Vercel with zero setup.

export interface StoredMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  modelId: string;
  messages: StoredMessage[];
  createdAt: number;
  updatedAt: number;
}

const KEY = "homeworkai_sessions_v1";

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadSessions(): ChatSession[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatSession[];
    return Array.isArray(parsed) ? parsed.sort((a, b) => b.updatedAt - a.updatedAt) : [];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: ChatSession[]) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(sessions));
  } catch {
    // storage full or unavailable — fail silently, chat still works in-memory
  }
}

export function newSession(modelId: string): ChatSession {
  const now = Date.now();
  return {
    id: `s_${now}_${Math.random().toString(36).slice(2, 8)}`,
    title: "New chat",
    modelId,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function titleFromFirstMessage(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.length > 40 ? trimmed.slice(0, 40) + "…" : trimmed || "New chat";
}