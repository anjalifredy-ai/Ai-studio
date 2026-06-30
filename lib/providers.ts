// lib/providers.ts
// Thin adapters that normalize every provider's chat-completion API
// into one shape: callModel(messages, modelOption) -> string

import { ModelOption } from "./models";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface CallResult {
  text: string;
}

class ProviderError extends Error {
  constructor(public provider: string, public status: number, message: string) {
    super(message);
  }
}

// ---------------- Groq ----------------
// OpenAI-compatible chat completions endpoint.
async function callGroq(messages: ChatMessage[], modelId: string): Promise<CallResult> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new ProviderError("groq", 500, "GROQ_API_KEY missing on server");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      temperature: 0.6,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new ProviderError("groq", res.status, errText);
  }
  const data = await res.json();
  return { text: data.choices?.[0]?.message?.content ?? "" };
}

// ---------------- Google Gemini ----------------
async function callGemini(messages: ChatMessage[], modelId: string): Promise<CallResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new ProviderError("gemini", 500, "GEMINI_API_KEY missing on server");

  // Gemini wants a "system instruction" separated out, and uses "model" role
  // instead of "assistant".
  const systemMsgs = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n");
  const turns = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const body: Record<string, unknown> = {
    contents: turns,
    generationConfig: { temperature: 0.6, maxOutputTokens: 4096 },
  };
  if (systemMsgs) {
    body.systemInstruction = { parts: [{ text: systemMsgs }] };
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new ProviderError("gemini", res.status, errText);
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join("") ?? "";
  return { text };
}

// ---------------- DeepSeek (OpenAI-compatible) ----------------
async function callDeepSeek(messages: ChatMessage[], modelId: string): Promise<CallResult> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new ProviderError("deepseek", 500, "DEEPSEEK_API_KEY missing on server");

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      temperature: 0.6,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new ProviderError("deepseek", res.status, errText);
  }
  const data = await res.json();
  return { text: data.choices?.[0]?.message?.content ?? "" };
}

// ---------------- OpenRouter (OpenAI-compatible aggregator) ----------------
async function callOpenRouter(messages: ChatMessage[], modelId: string): Promise<CallResult> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new ProviderError("openrouter", 500, "OPENROUTER_API_KEY missing on server");

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": process.env.SITE_URL || "https://localhost:3000",
      "X-Title": "HomeworkAI",
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      temperature: 0.6,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new ProviderError("openrouter", res.status, errText);
  }
  const data = await res.json();
  return { text: data.choices?.[0]?.message?.content ?? "" };
}

export async function callModel(messages: ChatMessage[], model: ModelOption): Promise<CallResult> {
  switch (model.provider) {
    case "groq":
      return callGroq(messages, model.modelId);
    case "gemini":
      return callGemini(messages, model.modelId);
    case "deepseek":
      return callDeepSeek(messages, model.modelId);
    case "openrouter":
      return callOpenRouter(messages, model.modelId);
    default:
      throw new ProviderError("unknown", 400, "Unknown provider");
  }
}

export { ProviderError };