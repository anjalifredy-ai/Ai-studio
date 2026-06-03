import { useState, useRef, useEffect } from "react";

const MODELS = [
  { id: "gemini-2.0-flash", name: "Gemini Flash 2.0", icon: "✨", color: "#4285f4", desc: "Sabse Fast - Free!" },
  { id: "gemini-1.5-pro", name: "Gemini Pro", icon: "💎", color: "#34a853", desc: "Smart & Powerful" },
  { id: "gemini-1.5-flash", name: "Gemini Flash", icon: "⚡", color: "#fbbc04", desc: "Balanced" },
];

function ChatBubble({ msg, color }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 16, gap: 8 }}>
      {!isUser && <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginTop: 2, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>AI</div>}
      <div style={{ maxWidth: "78%", padding: "11px 15px", borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: isUser ? color : "#18181b", color: "#f4f4f5", fontSize: 14, lineHeight: 1.7, border: isUser ? "none" : "1px solid #27272a", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.content}</div>
    </div>
  );
}

export default function App() {
  const [model, setModel] = useState(MODELS[0]);
  const [chats, setChats] = useState([{ id: 1, title: "New Chat", messages: [] }]);
  const [activeChatId, setActiveChatId] = useState(1);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modelOpen, setModelOpen] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
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

  const newChat = () => { const id = nextId.current++; setChats(prev => [...prev, { id, title: "New Chat", messages: [] }]); setActiveChatId(id); setError(""); };
  const deleteChat = (id, e) => { e.stopPropagation(); if (chats.length === 1) return; const remaining = chats.filter(c => c.id !== id); setChats(remaining); if (activeChatId === id) setActiveChatId(remaining[remaining.length - 1].id); };
  const updateChat = (id, msgs) => { setChats(prev => prev.map(c => { if (c.id !== id) return c; const title = msgs.find(m => m.role === "user")?.content?.slice(0, 28) || "New Chat"; return { ...c, messages: msgs, title }; })); };

  const send = async (txt) => {
    const text = (txt || input).trim();
    if (!text || loading) return;
    setInput(""); setError("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    const newMsgs = [...messages, { role: "user", content: text }];
    updateChat(activeChatId, newMsgs);
    setLoading(true); setStreamText("Soch raha hoon...");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: model.id, messages: newMsgs }),
      });
      const data = await res.json();
      const reply = data.text || "Koi response nahi mila.";
      updateChat(activeChatId, [...newMsgs, { role: "assistant", content: reply }]);
    } catch (e) {
      setError("⚠️ Error aaya! Dobara try karo.");
    } finally { setLoading(false); setStreamText(""); }
  };

  return (
    <div style={{ height: "100vh", display: "flex", background: "#09090b", color: "#f4f4f5", fontFamily: "sans-serif", overflow: "hidden" }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.3;}}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#27272a;border-radius:4px;}textarea{resize:none;outline:none;}.chat-item:hover{background:#18181b!important;}.model-opt:hover{background:rgba(255,255,255,0.05)!important;}`}</style>
      {sidebarOpen && (
        <div style={{ width: 220, display: "flex", flexDirection: "column", borderRight: "1px solid #18181b", background: "#0c0c0e", flexShrink: 0 }}>
          <div style={{ padding: "14px 12px 10px", borderBottom: "1px solid #18181b" }}>
            <div style={{ fontSize: 15, fontWeight: 800, background: `linear-gradient(90deg,#fff,${mc})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI Studio</div>
            <div style={{ fontSize: 9, color: "#3f3f46", letterSpacing: 2 }}>GEMINI MODELS</div>
          </div>
          <button onClick={newChat} style={{ margin: "8px", padding: "8px 12px", borderRadius: 8, border: "1px solid #27272a", background: "transparent", color: "#a1a1aa", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 16 }}>+</span> New Chat
          </button>
          <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
            {[...chats].reverse().map(c => (
              <div key={c.id} className="chat-item" onClick={() => { setActiveChatId(c.id); setError(""); }} style={{ padding: "8px", borderRadius: 8, cursor: "pointer", marginBottom: 2, background: activeChatId === c.id ? "#18181b" : "transparent", borderLeft: activeChatId === c.id ? `2px solid ${mc}` : "2px solid transparent", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: activeChatId === c.id ? "#f4f4f5" : "#71717a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>💬 {c.title}</span>
                {chats.length > 1 && <button onClick={(e) => deleteChat(c.id, e)} style={{ background: "none", border: "none", color: "#3f3f46", cursor: "pointer", fontSize: 14 }} onMouseEnter={e => e.target.style.color = "#ef4444"} onMouseLeave={e => e.target.style.color = "#3f3f46"}>×</button>}
              </div>
            ))}
          </div>
          <div style={{ padding: "8px 12px 12px", borderTop: "1px solid #18181b", display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 5px #22c55e", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 10, color: "#22c55e" }}>Free · Gemini</span>
          </div>
        </div>
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid #18181b", display: "flex", alignItems: "center", gap: 8, background: "#09090b" }}>
          <button onClick={() => setSidebarOpen(p => !p)} style={{ background: "none", border: "none", color: "#52525b", cursor: "pointer", fontSize: 18 }}>☰</button>
          <div ref={modelRef} style={{ position: "relative" }}>
            <button onClick={() => setModelOpen(p => !p)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, border: `1px solid ${modelOpen ? mc : "#27272a"}`, background: "#18181b", color: "#f4f4f5", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              <span>{model.icon}</span><span>{model.name}</span><span style={{ color: "#52525b" }}>▾</span>
            </button>
            {modelOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 5px)", left: 0, background: "#111113", border: "1px solid #27272a", borderRadius: 12, minWidth: 200, zIndex: 50, overflow: "hidden", boxShadow: "0 12px 32px rgba(0,0,0,0.7)" }}>
                {MODELS.map(m => (
                  <div key={m.id} className="model-opt" onClick={() => { setModel(m); setModelOpen(false); }} style={{ padding: "9px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{m.icon}</span>
                    <div><div style={{ fontSize: 12, fontWeight: 600, color: model.id === m.id ? m.color : "#e4e4e7" }}>{m.name}</div><div style={{ fontSize: 10, color: "#52525b" }}>{m.desc}</div></div>
                    {model.id === m.id && <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.color, marginLeft: "auto" }} />}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 600 }}>Live</span>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 0" }}>
          {messages.length === 0 && !loading && (
            <div style={{ textAlign: "center", paddingTop: 50 }}>
              <div style={{ fontSize: 44, marginBottom: 8 }}>{model.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{model.name}</div>
              <div style={{ fontSize: 12, color: mc, marginBottom: 4 }}>{model.desc}</div>
              <div style={{ fontSize: 11, color: "#3f3f46", marginBottom: 24 }}>Kuch bhi poochho!</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", maxWidth: 320, margin: "0 auto" }}>
                {["Motivate karo 🔥", "Joke sunao 😄", "Code likho 💻", "Help karo ✨"].map(s => (
                  <button key={s} onClick={() => send(s)} style={{ padding: "7px 14px", borderRadius: 18, border: "1px solid #27272a", background: "transparent", color: "#71717a", cursor: "pointer", fontSize: 11 }} onMouseEnter={e => { e.currentTarget.style.borderColor = mc; e.currentTarget.style.color = mc; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#27272a"; e.currentTarget.style.color = "#71717a"; }}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => <ChatBubble key={i} msg={msg} color={mc} />)}
          {loading && (
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: mc, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", animation: "pulse 1.5s infinite" }}>AI</div>
              <div style={{ padding: "11px 15px", borderRadius: "18px 18px 18px 4px", background: "#18181b", color: "#71717a", fontSize: 13, border: `1px solid ${mc}44` }}>{streamText}</div>
            </div>
          )}
          {error && <div style={{ margin: "0 0 12px", padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 10, color: "#f87171", fontSize: 12 }}>{error}</div>}
          <div ref={bottomRef} style={{ height: 8 }} />
        </div>
        <div style={{ padding: "10px 14px 14px", borderTop: "1px solid #18181b", background: "#09090b" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", background: "#18181b", border: `1px solid ${loading ? mc + "55" : "#27272a"}`, borderRadius: 14, padding: "8px 10px" }}>
            <textarea ref={textareaRef} rows={1} value={input} onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={`${model.name} se poochho...`} style={{ flex: 1, background: "none", border: "none", color: "#f4f4f5", fontSize: 13, lineHeight: 1.5, maxHeight: 120, overflow: "auto", caretColor: mc }} />
            <button onClick={() => send()} disabled={!input.trim() || loading} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: input.trim() && !loading ? mc : "#27272a", color: input.trim() && !loading ? "#fff" : "#52525b", cursor: input.trim() && !loading ? "pointer" : "default", fontSize: 16, flexShrink: 0, transition: "all 0.2s" }}>↑</button>
          </div>
        </div>
      </div>
    </div>
  );
            }
