export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const { model, messages } = req.body;
    const key = AQ.Ab8RN6Lgb6I9ANAsC55QRFqEqic-tlaOgmR-V_uJxbhiyMeeiQ
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });
    const d = await r.json();
    const text = d.candidates?.[0]?.content?.parts?.[0]?.text || 'Error';
    res.status(200).json({ text });
  } catch(e) {
    res.status(500).json({ text: e.message });
  }
}
