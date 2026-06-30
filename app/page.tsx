import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="text-5xl mb-4">🎓</div>
      <h1 className="text-3xl sm:text-4xl font-bold mb-3">
        Homework<span className="text-accent">AI</span>
      </h1>
      <p className="text-textdim max-w-md mb-8">
        Solve any homework — math, science, essays, coding — using free AI models.
        Chat freely or get step-by-step solved answers, with full history saved.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/solve"
          className="bg-accent hover:bg-accent/90 transition-colors text-white font-medium px-6 py-3 rounded-xl"
        >
          📚 Solve Homework
        </Link>
        <Link
          href="/chat"
          className="bg-panel2 hover:bg-border transition-colors border border-border text-textmain font-medium px-6 py-3 rounded-xl"
        >
          💬 Open Chat
        </Link>
      </div>
      <p className="text-xs text-textdim mt-10">
        Powered by free models: Groq (Llama, Mixtral), Gemini, DeepSeek, OpenRouter
      </p>
    </main>
  );
}