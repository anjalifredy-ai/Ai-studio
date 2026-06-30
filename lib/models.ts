// lib/models.ts
// Central registry of every free-tier model we expose to the UI.
// Each entry knows which provider it belongs to so the API route
// can route the request correctly.

export type Provider = "groq" | "gemini" | "deepseek" | "openrouter";

export interface ModelOption {
  id: string;          // unique id used in the UI <select>
  label: string;       // human friendly name
  provider: Provider;  // which backend handles it
  modelId: string;      // the actual model string sent to that provider's API
  description: string;
}

export const MODELS: ModelOption[] = [
  // ---- Groq (very fast, generous free tier) ----
  {
    id: "groq-llama-3.3-70b",
    label: "Llama 3.3 70B (Groq)",
    provider: "groq",
    modelId: "llama-3.3-70b-versatile",
    description: "Fast, strong general reasoning",
  },
  {
    id: "groq-llama-3.1-8b",
    label: "Llama 3.1 8B Instant (Groq)",
    provider: "groq",
    modelId: "llama-3.1-8b-instant",
    description: "Very fast, lightweight tasks",
  },
  {
    id: "groq-mixtral",
    label: "Mixtral 8x7B (Groq)",
    provider: "groq",
    modelId: "mixtral-8x7b-32768",
    description: "Good for long context",
  },
  {
    id: "groq-deepseek-r1",
    label: "DeepSeek R1 Distill 70B (Groq)",
    provider: "groq",
    modelId: "deepseek-r1-distill-llama-70b",
    description: "Strong step-by-step reasoning",
  },

  // ---- Google Gemini (free tier via AI Studio) ----
  {
    id: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    provider: "gemini",
    modelId: "gemini-2.0-flash",
    description: "Fast, multimodal, great all-rounder",
  },
  {
    id: "gemini-1.5-flash",
    label: "Gemini 1.5 Flash",
    provider: "gemini",
    modelId: "gemini-1.5-flash",
    description: "Reliable free-tier workhorse",
  },

  // ---- DeepSeek native API ----
  {
    id: "deepseek-chat",
    label: "DeepSeek V3 (Chat)",
    provider: "deepseek",
    modelId: "deepseek-chat",
    description: "Great at essays & explanations",
  },
  {
    id: "deepseek-reasoner",
    label: "DeepSeek R1 (Reasoner)",
    provider: "deepseek",
    modelId: "deepseek-reasoner",
    description: "Best for math & complex logic",
  },

  // ---- OpenRouter (aggregator, many free models behind one key) ----
  {
    id: "openrouter-llama-3.3-70b-free",
    label: "Llama 3.3 70B (OpenRouter, free)",
    provider: "openrouter",
    modelId: "meta-llama/llama-3.3-70b-instruct:free",
    description: "Backup route for Llama 70B",
  },
  {
    id: "openrouter-gemini-flash-free",
    label: "Gemini 2.0 Flash (OpenRouter, free)",
    provider: "openrouter",
    modelId: "google/gemini-2.0-flash-exp:free",
    description: "Backup route for Gemini",
  },
  {
    id: "openrouter-mistral-7b-free",
    label: "Mistral 7B (OpenRouter, free)",
    provider: "openrouter",
    modelId: "mistralai/mistral-7b-instruct:free",
    description: "Light, quick answers",
  },
];

export function getModelById(id: string): ModelOption | undefined {
  return MODELS.find((m) => m.id === id);
}

export const DEFAULT_MODEL_ID = "groq-llama-3.3-70b";