const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const { model, messages } = req.body;
    const genAI = new GoogleGenerativeAIAQ.AQ.Ab8RN6Lgb6I9ANAsC55QRFqEqic-tlaOgmR-V_uJxbhiyMeeiQ
    const m = genAI.getGenerativeModel({ model });
    const history = messages.slice(0,-1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    const chat = m.startChat({ history });
    const result = await chat.sendMessage(messages[messages.length-1].content);
    const text = result.response.text();
    res.status(200).json({ text });
  } catch(e) {
    res.status(500).json({ text: 'Error: ' + e.message });
  }
}
