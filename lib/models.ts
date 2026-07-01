// lib/models.ts
// Central registry of every free-tier model we expose to the UI.
// Each entry knows which provider it belongs to so the API route
// can route the request correctly.

export type Provider = "groq" | "gemini" | "deepseek" | "openrouter";

export interface ModelOption {
  id: string;          // unique id used in the UI <select>
  label: string;       // human friendly name (what the user sees)
  provider: Provider;  // which backend actually handles it
  modelId: string;      // the actual model string sent to that provider's API
  description: string;
  isCustom?: boolean;   // true for branded models — hides the real provider from the UI
  customPersona?: string; // extra system-prompt text injected for custom/branded models
}

export const MODELS: ModelOption[] = [
  // ---- Your own branded models ("Remon" family) ----
  // Each shows up under its own Remon name in the UI. Under the hood they
  // run on different Groq free models chosen to match the tier's speed vs
  // power tradeoff. Change modelId on any of these to swap what powers it.
  {
    id: "remon-flash",
    label: "Remon Flash ⚡",
    provider: "groq",
    modelId: "llama-3.1-8b-instant",
    description: "Fastest — great for quick, simple questions",
    isCustom: true,
    customPersona:
      "You are Remon Flash, a lightning-fast AI assistant. You give short, direct, to-the-point " +
      "answers optimized for speed while staying accurate. You never mention what underlying model " +
      "or company powers you — you are simply Remon Flash.",
  },
  {
    id: "remon-fast",
    label: "Remon Fast 🚀",
    provider: "groq",
    modelId: "meta-llama/llama-4-scout-17b-16e-instruct",
    description: "Fast with solid reasoning — good everyday default",
    isCustom: true,
    customPersona:
      "You are Remon Fast, a quick and capable AI assistant. You balance speed with genuinely " +
      "useful, clear answers, and you don't over-explain unless asked. You never mention what " +
      "underlying model or company powers you — you are simply Remon Fast.",
  },
  {
    id: "remon-medium",
    label: "Remon Medium ⚖️",
    provider: "groq",
    modelId: "llama-3.3-70b-versatile",
    description: "Balanced — strong reasoning for most homework tasks",
    isCustom: true,
    customPersona:
      "You are Remon Medium, a well-rounded AI assistant. You give clear, thorough answers with " +
      "solid reasoning, striking a balance between speed and depth. You never mention what " +
      "underlying model or company powers you — you are simply Remon Medium.",
  },
  {
    id: "remon-pro",
    label: "Remon Pro ⭐",
    provider: "groq",
    modelId: "meta-llama/llama-4-maverick-17b-128e-instruct",
    description: "Premium expert-level AI — best for tough questions",
    isCustom: true,
    customPersona:
      "You are Remon Pro, a premium, high-intelligence AI assistant. You give thorough, " +
      "expert-level answers — precise, well-structured, and going a level deeper than a " +
      "typical assistant. You double-check your reasoning before finalizing an answer. " +
      "You never mention what underlying model or company powers you — you are simply Remon Pro.",
  },

  // ---- Groq (very fast, generous free tier, models hosted directly) ----
  {
    id: "groq-llama-4-scout",
    label: "Llama 4 Scout (Groq)",
    provider: "groq",
    modelId: "meta-llama/llama-4-scout-17b-16e-instruct",
    description: "Latest Llama 4, strong all-round reasoning",
  },
  {
    id: "groq-llama-4-maverick",
    label: "Llama 4 Maverick (Groq)",
    provider: "groq",
    modelId: "meta-llama/llama-4-maverick-17b-128e-instruct",
    description: "Latest Llama 4, best for complex tasks",
  },
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
    id: "groq-deepseek-r1",
    label: "DeepSeek R1 Distill 70B (Groq)",
    provider: "groq",
    modelId: "deepseek-r1-distill-llama-70b",
    description: "Strong step-by-step reasoning",
  },
  {
    id: "groq-qwen3-32b",
    label: "Qwen 3 32B (Groq)",
    provider: "groq",
    modelId: "qwen/qwen3-32b",
    description: "Great at math and coding",
  },
  {
    id: "groq-gpt-oss-120b",
    label: "GPT-OSS 120B (Groq)",
    provider: "groq",
    modelId: "openai/gpt-oss-120b",
    description: "OpenAI's open-weight model, very thorough",
  },
  {
    id: "groq-gpt-oss-20b",
    label: "GPT-OSS 20B (Groq)",
    provider: "groq",
    modelId: "openai/gpt-oss-20b",
    description: "Lighter OpenAI open-weight model, fast",
  },
  {
    id: "groq-kimi-k2",
    label: "Kimi K2 (Groq)",
    provider: "groq",
    modelId: "moonshotai/kimi-k2-instruct",
    description: "Excellent for long essays & writing",
  },

  // ---- Google Gemini (free tier via AI Studio) ----
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    provider: "gemini",
    modelId: "gemini-2.5-flash",
    description: "Latest Gemini, fast, multimodal, great all-rounder",
  },
  {
    id: "gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash Lite",
    provider: "gemini",
    modelId: "gemini-2.5-flash-lite",
    description: "Even faster, lighter, higher free quota",
  },
  {
    id: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    provider: "gemini",
    modelId: "gemini-2.0-flash",
    description: "Reliable, well-tested free-tier workhorse",
  },

  // ---- DeepSeek native API (small paid cost — needs balance) ----
  {
    id: "deepseek-chat",
    label: "DeepSeek V3 (Chat)",
    provider: "deepseek",
    modelId: "deepseek-chat",
    description: "Great at essays & explanations (needs account balance)",
  },
  {
    id: "deepseek-reasoner",
    label: "DeepSeek R1 (Reasoner)",
    provider: "deepseek",
    modelId: "deepseek-reasoner",
    description: "Best for math & complex logic (needs account balance)",
  },

  // ---- OpenRouter (aggregator) ----
  // NOTE: OpenRouter's specific ":free" model IDs change or disappear
  // frequently — providers rotate their free offerings weekly, and
  // hardcoded slugs (like specific Llama/Qwen/DeepSeek :free routes)
  // regularly go stale and return 404s. "openrouter/free" is OpenRouter's
  // own auto-router: it always picks whichever free model is currently
  // live, so this option keeps working even as the underlying list changes.
  {
    id: "openrouter-auto-free",
    label: "Auto Free Router (OpenRouter)",
    provider: "openrouter",
    modelId: "openrouter/free",
    description: "Always picks a currently-working free model — most reliable",
  },
];

export function getModelById(id: string): ModelOption | undefined {
  return MODELS.find((m) => m.id === id);
}

export const DEFAULT_MODEL_ID = "remon-medium";