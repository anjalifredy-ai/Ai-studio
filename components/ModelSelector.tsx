"use client";

import { MODELS, Provider } from "@/lib/models";

const PROVIDER_LABELS: Record<Provider, string> = {
  groq: "⚡ Groq",
  gemini: "✨ Gemini",
  deepseek: "🐋 DeepSeek",
  openrouter: "🔀 OpenRouter",
};

export default function ModelSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const grouped = MODELS.reduce<Record<string, typeof MODELS>>((acc, m) => {
    acc[m.provider] = acc[m.provider] || [];
    acc[m.provider].push(m);
    return acc;
  }, {});

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-panel2 border border-border text-textmain text-sm rounded-lg px-3 py-2
                 focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer max-w-[220px]"
    >
      {Object.entries(grouped).map(([provider, models]) => (
        <optgroup key={provider} label={PROVIDER_LABELS[provider as Provider]}>
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}