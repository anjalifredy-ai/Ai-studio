export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const { model, messages } = req.body;
    const key = AQ.Ab8RN6Lgb6I9ANAsC55QRFqEqic-tlaOgmR-V_uJxbhiyMeeiQ
    const last = messages[messages.length - 1].content;
    const r = await globalThis.fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: last }] }] }),
      }
    );
    const d = await r.json();
    const text = d.candidates?.[0]?.content?.parts?.[0]?.text || 'Error';
    res.status(200).json({ text });
  } catch(e) {
    res.status(500).json({ text: e.message });
  }
}
