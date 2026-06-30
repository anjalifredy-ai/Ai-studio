"use client";

import { useState } from "react";
import NavBar from "@/components/NavBar";
import ModelSelector from "@/components/ModelSelector";
import TypingDots from "@/components/TypingDots";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DEFAULT_MODEL_ID } from "@/lib/models";

const SUBJECTS = [
  { id: "general", label: "📋 General" },
  { id: "math", label: "🔢 Math" },
  { id: "science", label: "🔬 Science" },
  { id: "essay", label: "✍️ Essay / Writing" },
  { id: "coding", label: "💻 Coding" },
  { id: "language", label: "🗣️ Language" },
];

interface SolvedItem {
  question: string;
  subject: string;
  answer: string;
  model: string;
}

export default function SolvePage() {
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState("general");
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SolvedItem[]>([]);

  async function handleSolve() {
    if (!question.trim() || loading) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim(), subject, modelId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      setHistory((prev) => [
        { question: question.trim(), subject, answer: data.answer, model: data.model },
        ...prev,
      ]);
      setQuestion("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        <h1 className="text-xl font-semibold mb-1">📚 Homework Solver</h1>
        <p className="text-textdim text-sm mb-5">
          Paste your question, pick a subject, and get a complete step-by-step solution.
        </p>

        <div className="bg-panel border border-border rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {SUBJECTS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSubject(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  subject === s.id
                    ? "bg-accent text-white"
                    : "bg-panel2 text-textdim hover:text-textmain border border-border"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type or paste your homework question here..."
            rows={5}
            className="w-full bg-panel2 border border-border rounded-xl px-4 py-3 text-sm resize-none
                       focus:outline-none focus:ring-2 focus:ring-accent/50"
          />

          <div className="flex items-center justify-between mt-3">
            <ModelSelector value={modelId} onChange={setModelId} />
            <button
              onClick={handleSolve}
              disabled={loading || !question.trim()}
              className="bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed
                         text-white rounded-xl px-5 py-2.5 text-sm font-medium transition-colors"
            >
              {loading ? "Solving..." : "Solve →"}
            </button>
          </div>
        </div>

        {loading && (
          <div className="mb-6">
            <TypingDots />
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3 mb-6">
            ⚠️ {error}
          </div>
        )}

        <div className="space-y-4">
          {history.map((item, i) => (
            <div key={i} className="bg-panel border border-border rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-panel2/50">
                <p className="text-sm font-medium text-textmain whitespace-pre-wrap">{item.question}</p>
                <p className="text-xs text-textdim mt-1">
                  {SUBJECTS.find((s) => s.id === item.subject)?.label} · {item.model}
                </p>
              </div>
              <div className="px-4 py-4 markdown-body text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.answer}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>

        {history.length === 0 && !loading && (
          <div className="text-center text-textdim text-sm py-10">
            Your solved answers will appear here.
          </div>
        )}
      </main>
    </div>
  );
}