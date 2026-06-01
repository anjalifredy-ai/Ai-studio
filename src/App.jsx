import { useState, useRef, useEffect } from "react";

const MODELS = [
  { id: "claude-haiku-4-5-20251001", name: "Claude Haiku", short: "Haiku", icon: "⚡", color: "#f97316", desc: "Sabse Fast" },
  { id: "claude-sonnet-4-20250514", name: "Claude Sonnet", short: "Sonnet", icon: "🎯", color: "#06b6d4", desc: "Smart & Balanced" },
  { id: "claude-opus-4-5", name: "Claude Opus", short: "Opus", icon: "👑", color: "#a855f7", desc: "Sabse Smart" },
];

function ChatBubble({ msg, color }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 16, gap: 8, animation: "fadeUp 0.2s ease" }}>
      {!isUser && (
        <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginTop: 2, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>AI</div>
      )}
      <div style={{
        maxWidth: "78%", padding: "11px 15px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: isUser ? color : "#18181b",
        color: "#f4f4f5", fontSize: 14, lineHeight: 1.7,
        border: isUser ? "none" : "1px solid #27272a",
        whiteSpace: "pre-wrap", wordBreak: "break-word",
        boxShadow: isUser ? `0 4px 20px ${color}33` : "none",
        fontFamily: "'DM Sans', sans-serif",
      }}>{msg.content}</div>
    </div>
  );
}

function StreamBubble({ text, color }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginTop: 2, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", animation: "pulse 1.5s infinite" }}>AI</div>
      <div style={{ maxWidth: "78%", padding: "11px 15px", borderRadius: "18px 18px 18px 4px", background: "#18181b", color: "#f4f4f5", fontSize: 14, lineHeight: 1.7, border: `1px solid ${color}44`, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "'DM Sans', sans-serif" }}>
        {text
          ? <>{text}<span style={{ display: "inline-block", width: 2, height: 13, background: color, marginLeft: 2, animation: "blink 0.6s infinite", verticalAlign: "middle" }} /></>
          : <span style={{ display: "inline-flex", gap: 4 }}>{[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block", animation: `bounce 1s ${i*0.15}s infinite` }} />)}</span>
        }
      </div>
    </div>
  );
}

export default function App() {
  const [model, setModel] = useState(MODELS[0]);
  const [chats, setChats] = useState([{ id: 1, title: "New Chat", messages: [] }]);
  const [activeChatId, setActiveChatId] = useState(1);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modelOpen, setModelOpen] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const abortRef = useRef(null);
  const nextId = useRef(2);
  const modelRef = useRef(null);

  const activeChat = chats.find(c => c.id === activeChatId);
  const messages = activeChat?.messages || [];
  const mc = model.color;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streamText]);

  useEffect(() => {
    const h = e => { if (modelRef.current && !modelRef.current.contains(e.target)) setModelOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const newChat = () => {
    const id = nextId.current++;
    setChats(prev => [...prev, { id, title: "New Chat", messages: [] }]);
    setActiveChatId(id);
    setError("");
  };

  const deleteChat = (id, e) => {
    e.stopPropagation();
    if (chats.length === 1) return;
    const remaining = chats.filter(c => c.id !== id);
    setChats(remaining);
    if (activeChatId === id) setActiveChatId(remaining[remaining.length - 1].id);
  };

  const updateChat = (id, msgs) => {
    setChats(prev => prev.map(c => {
      if (c.id !== id) return c;
      const title = msgs.find(m => m.role === "user")?.content?.slice(0, 28) || "New Chat";
      return { ...c, messages: msgs, title };
    }));
  };

  const send = async (txt) => {
    const text = (txt || input).trim();
    if (!text || streaming) return;
    setInput(""); setError("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    const newMsgs = [...messages, { role: "user", content: text }];
    updateChat(activeChatId, newMsgs);
    setStreaming(true); setStreamText("");
    abortRef.current = new AbortController();
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", signal: abortRef.current.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: model.id, max_tokens: 1000, stream: true, messages: newMsgs }),
      });
      if (!res.ok) throw new Error("err");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        for (const line of dec.decode(value, { stream: true }).split("\n").filter(l => l.startsWith("data:"))) {
          try { const p = JSON.parse(line.slice(5).trim()); if (p.delta?.text) { full += p.delta.text; setStreamText(full); } } catch {}
        }
      }
      updateChat(activeChatId, [...newMsgs, { role: "assistant", content: full || "Koi response nahi mila." }]);
    } catch (e) {
      if (e.name !== "AbortError") setError("⚠️ Error aaya! Dobara try karo.");
    } finally { setStreaming(false); setStreamText(""); }
  };

  return (
    <div style={{ height: "100vh", display: "flex", background: "#09090b", color: "#f4f4f5", fontFamily: "'DM Sans', sans-serif", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.3;}}
        @keyframes bounce{0%,60%,100%{transform:translateY(0);}30%{transform:translateY(-5px);}}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:#27272a;border-radius:4px;}
        textarea{resize:none;outline:none;}
        .chat-item:hover{background:#18181b!important;}
        .new-chat:hover{background:#1f1f23!important;}
        .model-opt:hover{background:rgba(255,255,255,0.05)!important;}
        .stop:hover{border-color:#ef4444!important;color:#ef4444!important;}
      `}</style>

      {/* SIDEBAR */}
      {sidebarOpen && (
        <div style={{ width: 230, display: "flex", flexDirection: "column", borderRight: "1px solid #18181b", background: "#0c0c0e", flexShrink: 0 }}>
          <div style={{ padding: "16px 14px 12px", borderBottom: "1px solid #18181b" }}>
            <div style={{ fontSize: 16, fontWeight: 800, background: `linear-gradient(90deg,#fff,${mc})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", transition: "all 0.4s", letterSpacing: "-0.5px" }}>AI Studio</div>
            <div style={{ fontSize: 10, color: "#3f3f46", letterSpacing: 2, marginTop: 1 }}>CLAUDE MODELS</div>
          </div>

          <div style={{ padding: "10px 10px 6px" }}>
            <button className="new-chat" onClick={newChat} style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #27272a", background: "transparent", color: "#a1a1aa", cursor: "pointer", fontSize: 13, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8, transition: "background 0.15s" }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New Chat
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "4px 10px" }}>
            <div style={{ fontSize: 10, color: "#3f3f46", letterSpacing: 2, padding: "8px 4px 6px", fontWeight: 600 }}>HISTORY</div>
            {[...chats].reverse().map(c => (
              <div key={c.id} className="chat-item" onClick={() => { setActiveChatId(c.id); setError(""); }} style={{
                padding: "9px 10px", borderRadius: 9, cursor: "pointer", marginBottom: 2,
                background: activeChatId === c.id ? "#18181b" : "transparent",
                borderLeft: activeChatId === c.id ? `2px solid ${mc}` : "2px solid transparent",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, transition: "all 0.15s",
              }}>
                <div style={{ fontSize: 13, color: activeChatId === c.id ? "#f4f4f5" : "#71717a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>💬 {c.title}</div>
                {chats.length > 1 && (
                  <button onClick={(e) => deleteChat(c.id, e)} style={{ background: "none", border: "none", color: "#3f3f46", cursor: "pointer", fontSize: 15, padding: "0 2px", flexShrink: 0 }}
                    onMouseEnter={e => e.target.style.color = "#ef4444"} onMouseLeave={e => e.target.style.color = "#3f3f46"}>×</button>
                )}
              </div>
            ))}
          </div>

          <div style={{ padding: "10px 14px 14px", borderTop: "1px solid #18181b" }}>
            <div style={{ fontSize: 11, color: "#3f3f46", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e", animation: "pulse 2s infinite" }} />
              No API key needed
            </div>
          </div>
        </div>
      )}

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* HEADER */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #18181b", display: "flex", alignItems: "center", gap: 10, background: "#09090b", flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(p => !p)} style={{ background: "none", border: "none", color: "#52525b", cursor: "pointer", fontSize: 18, padding: "2px 6px", borderRadius: 6, transition: "color 0.15s" }}
            onMouseEnter={e => e.target.style.color = "#f4f4f5"} onMouseLeave={e => e.target.style.color = "#52525b"}>☰</button>

          {/* Model Dropdown */}
          <div ref={modelRef} style={{ position: "relative" }}>
            <button onClick={() => setModelOpen(p => !p)} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "7px 12px",
              borderRadius: 10, border: `1px solid ${modelOpen ? mc : "#27272a"}`,
              background: "#18181b", color: "#f4f4f5", cursor: "pointer",
              fontSize: 13, fontFamily: "inherit", transition: "border-color 0.2s",
            }}>
              <span>{model.icon}</span>
              <span style={{ fontWeight: 600 }}>{model.name}</span>
              <span style={{ color: "#52525b", fontSize: 11 }}>▾</span>
            </button>
            {modelOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, background: "#111113", border: "1px solid #27272a", borderRadius: 14, minWidth: 220, zIndex: 50, overflow: "hidden", boxShadow: "0 16px 40px rgba(0,0,0,0.7)" }}>
                <div style={{ padding: "8px 14px 4px", fontSize: 10, color: "#f97316", letterSpacing: 2, fontWeight: 700 }}>CLAUDE MODELS</div>
                {MODELS.map(m => (
                  <div key={m.id} className="model-opt" onClick={() => { setModel(m); setModelOpen(false); }} style={{
                    padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, transition: "background 0.15s",
                  }}>
                    <span style={{ fontSize: 20 }}>{m.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: model.id === m.id ? m.color : "#e4e4e7" }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: "#52525b" }}>{m.desc}</div>
                    </div>
                    {model.id === m.id && <span style={{ width: 7, height: 7, borderRadius: "50%", background: m.color, flexShrink: 0, boxShadow: `0 0 8px ${m.color}` }} />}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 600 }}>Live</span>
          </div>
        </div>

        {/* MESSAGES */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 0" }}>
          {messages.length === 0 && !streaming && (
            <div style={{ textAlign: "center", paddingTop: 60, animation: "fadeUp 0.4s ease" }}>
              <div style={{ fontSize: 50, marginBottom: 10, filter: `drop-shadow(0 0 24px ${mc}88)`, transition: "filter 0.4s" }}>{model.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{model.name}</div>
              <div style={{ fontSize: 13, color: mc, marginBottom: 4, fontWeight: 600, transition: "color 0.3s" }}>{model.desc}</div>
              <div style={{ fontSize: 12, color: "#3f3f46", marginBottom: 28 }}>Kuch bhi poochho — main ready hoon!</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 360, margin: "0 auto" }}>
                {["Mujhe motivate karo 🔥", "Ek joke sunao 😄", "Python code likho 💻", "Meri help karo ✨"].map(s => (
                  <button key={s} onClick={() => send(s)} style={{ padding: "8px 16px", borderRadius: 20, border: "1px solid #27272a", background: "transparent", color: "#71717a", cursor: "pointer", fontSize: 12, fontFamily: "inherit", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = mc; e.currentTarget.style.color = mc; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#27272a"; e.currentTarget.style.color = "#71717a"; }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => <ChatBubble key={i} msg={msg} color={mc} />)}
          {streaming && <StreamBubble text={streamText} color={mc} />}
          {error && <div style={{ margin: "0 0 16px", padding: "11px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 10, color: "#f87171", fontSize: 13 }}>{error}</div>}
          <div ref={bottomRef} style={{ height: 8 }} />
        </div>

        {/* INPUT */}
        <div style={{ padding: "12px 16px 16px", borderTop: "1px solid #18181b", background: "#09090b", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", background: "#18181b", border: `1px solid ${streaming ? mc + "55" : "#27272a"}`, borderRadius: 16, padding: "10px 12px", transition: "border-color 0.3s" }}>
            <textarea ref={textareaRef} rows={1} value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={`${model.name} se poochho...`}
              style={{ flex: 1, background: "none", border: "none", color: "#f4f4f5", fontSize: 14, fontFamily: "inherit", lineHeight: 1.6, maxHeight: 120, overflow: "auto", caretColor: mc }}
            />
            {streaming
              ? <button className="stop" onClick={() => abortRef.current?.abort()} style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #27272a", background: "transparent", color: "#52525b", cursor: "pointer", fontSize: 14, flexShrink: 0, transition: "all 0.18s" }}>⏹</button>
              : <button onClick={() => send()} disabled={!input.trim()} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: input.trim() ? mc : "#27272a", color: input.trim() ? "#fff" : "#52525b", cursor: input.trim() ? "pointer" : "default", fontSize: 18, flexShrink: 0, transition: "all 0.2s", boxShadow: input.trim() ? `0 0 14px ${mc}44` : "none" }}>↑</button>
            }
          </div>
          <div style={{ textAlign: "center", fontSize: 10, color: "#27272a", marginTop: 6, letterSpacing: 1 }}>ENTER → SEND · SHIFT+ENTER → NEW LINE · ⚡ STREAMING ON</div>
        </div>
      </div>
    </div>
  );
}
