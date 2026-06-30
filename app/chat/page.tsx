"use client";

import { useEffect, useRef, useState } from "react";
import NavBar from "@/components/NavBar";
import ModelSelector from "@/components/ModelSelector";
import MessageBubble from "@/components/MessageBubble";
import TypingDots from "@/components/TypingDots";
import {
  ChatSession,
  loadSessions,
  saveSessions,
  newSession,
  titleFromFirstMessage,
  StoredMessage,
} from "@/lib/storage";
import { DEFAULT_MODEL_ID } from "@/lib/models";

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loaded = loadSessions();
    if (loaded.length > 0) {
      setSessions(loaded);
      setActiveId(loaded[0].id);
    } else {
      const s = newSession(DEFAULT_MODEL_ID);
      setSessions([s]);
      setActiveId(s.id);
    }
  }, []);

  const active = sessions.find((s) => s.id === activeId) || null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length, loading]);

  function persist(next: ChatSession[]) {
    setSessions(next);
    saveSessions(next);
  }

  function handleNewChat() {
    const s = newSession(active?.modelId || DEFAULT_MODEL_ID);
    const next = [s, ...sessions];
    persist(next);
    setActiveId(s.id);
    setSidebarOpen(false);
  }

  function handleDeleteSession(id: string) {
    const next = sessions.filter((s) => s.id !== id);
    persist(next);
    if (activeId === id) {
      if (next.length > 0) setActiveId(next[0].id);
      else {
        const s = newSession(DEFAULT_MODEL_ID);
        persist([s]);
        setActiveId(s.id);
      }
    }
  }

  function updateModelForActive(modelId: string) {
    if (!active) return;
    const next = sessions.map((s) => (s.id === active.id ? { ...s, modelId } : s));
    persist(next);
  }

  async function handleSend() {
    if (!input.trim() || !active || loading) return;
    setError(null);

    const userMsg: StoredMessage = { role: "user", content: input.trim() };
    const updatedMessages = [...active.messages, userMsg];
    const isFirst = active.messages.length === 0;

    const sessionAfterUser: ChatSession = {
      ...active,
      messages: updatedMessages,
      title: isFirst ? titleFromFirstMessage(userMsg.content) : active.title,
      updatedAt: Date.now(),
    };
    const nextSessions = sessions.map((s) => (s.id === active.id ? sessionAfterUser : s));
    persist(nextSessions);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, modelId: active.modelId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      const assistantMsg: StoredMessage = { role: "assistant", content: data.reply };
      const finalSession: ChatSession = {
        ...sessionAfterUser,
        messages: [...sessionAfterUser.messages, assistantMsg],
        updatedAt: Date.now(),
      };
      persist(nextSessions.map((s) => (s.id === active.id ? finalSession : s)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex flex-1 max-w-6xl mx-auto w-full">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden fixed bottom-4 left-4 z-20 bg-accent text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
        >
          ☰
        </button>

        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 fixed md:static inset-y-0 left-0 z-10 w-72 bg-panel border-r border-border
          flex flex-col transition-transform duration-200 pt-16 md:pt-0`}
        >
          <div className="p-3 border-b border-border">
            <button
              onClick={handleNewChat}
              className="w-full bg-accent hover:bg-accent/90 text-white rounded-lg py-2 text-sm font-medium"
            >
              + New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  setActiveId(s.id);
                  setSidebarOpen(false);
                }}
                className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm ${
                  s.id === activeId ? "bg-panel2 text-textmain" : "text-textdim hover:bg-panel2/50"
                }`}
              >
                <span className="truncate flex-1">{s.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSession(s.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-textdim hover:text-red-400 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-h-[calc(100vh-57px)]">
          <div className="border-b border-border px-4 py-2.5 flex justify-end">
            <ModelSelector
              value={active?.modelId || DEFAULT_MODEL_ID}
              onChange={updateModelForActive}
            />
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            {!active || active.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-textdim px-4">
                <div className="text-4xl mb-3">💬</div>
                <p className="font-medium text-textmain mb-1">Start a conversation</p>
                <p className="text-sm max-w-sm">
                  Ask anything — homework help, explanations, brainstorming, or just chat.
                </p>
              </div>
            ) : (
              active.messages.map((m, i) => (
                <MessageBubble key={i} role={m.role} content={m.content} />
              ))
            )}
            {loading && <TypingDots />}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3">
                ⚠️ {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-border p-3">
            <div className="flex gap-2 items-end max-w-3xl mx-auto">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                rows={1}
                className="flex-1 bg-panel2 border border-border rounded-xl px-4 py-3 text-sm resize-none
                           focus:outline-none focus:ring-2 focus:ring-accent/50 max-h-32"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed
                           text-white rounded-xl px-5 py-3 text-sm font-medium transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}