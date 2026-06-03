const send = async (txt) => {
    const text = (txt || input).trim();
    if (!text || loading) return;
    setInput(""); setError("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    const newMsgs = [...messages, { role: "user", content: text }];
    updateChat(activeChatId, newMsgs);
    setLoading(true); setStreamText("Soch raha hoon...");
    try {
      const key = AQ.Ab8RN6Lgb6I9ANAsC55QRFqEqic-tlaOgmR-V_uJxbhiyMeeiQ
      const contents = newMsgs.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent?key=${key}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents }) }
      );
      const d = await r.json();
      const reply = d.candidates?.[0]?.content?.parts?.[0]?.text || 'Koi response nahi mila.';
      updateChat(activeChatId, [...newMsgs, { role: "assistant", content: reply }]);
    } catch(e) {
      setError("⚠️ Error aaya! Dobara try karo.");
    } finally { setLoading(false); setStreamText(""); }
  };
