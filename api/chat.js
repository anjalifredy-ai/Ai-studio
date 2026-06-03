const https = require('https');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { model, messages } = body;
    const key = AQ.Ab8RN6Lgb6I9ANAsC55QRFqEqic-tlaOgmR-V_uJxbhiyMeeiQ
    
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      }
    );
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Koi response nahi mila.';
    return res.status(200).json({ text });
  } catch(e) {
    return res.status(500).json({ text: 'Error: ' + e.message });
  }
}
