// app/api/solve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { callModel, ChatMessage, ProviderError } from "@/lib/providers";
import { getModelById, DEFAULT_MODEL_ID } from "@/lib/models";

export const runtime = "nodejs";

const SUBJECT_HINTS: Record<string, string> = {
  math: "Show every calculation step clearly. Use proper mathematical notation. End with a clearly labeled final answer.",
  science: "Explain the underlying concept first, then work through the problem step by step. Mention relevant formulas or laws.",
  essay: "Write in a clear, well-structured way with an introduction, body, and conclusion. Match the requested tone and length.",
  coding: "Provide working, well-commented code in a code block, then briefly explain how it works.",
  language: "Be precise with grammar and vocabulary. Explain any corrections or translations clearly.",
  general: "Break the problem down into clear steps and explain your reasoning before giving the final answer.",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, subject, modelId } = body as {
      question: string;
      subject?: string;
      modelId?: string;
    };

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    const model = getModelById(modelId || DEFAULT_MODEL_ID);
    if (!model) {
      return NextResponse.json({ error: "Unknown model id" }, { status: 400 });
    }

    const hint = SUBJECT_HINTS[subject || "general"] || SUBJECT_HINTS.general;

    const systemPrompt: ChatMessage = {
      role: "system",
      content:
        "You are HomeworkAI, an expert tutor across every school and college subject: math, physics, chemistry, " +
        "biology, history, literature, essay writing, coding, and languages. A student will give you a homework " +
        "question or task. Solve it completely and correctly. " +
        hint +
        " Always format your answer with markdown for readability. If the question is ambiguous, state the " +
        "assumption you're making and proceed rather than refusing.",
    };

    const userMsg: ChatMessage = { role: "user", content: question };

    const result = await callModel([systemPrompt, userMsg], model);
    return NextResponse.json({ answer: result.text, model: model.label });
  } catch (err) {
    if (err instanceof ProviderError) {
      return NextResponse.json(
        { error: `${err.provider} error: ${err.message}` },
        { status: err.status >= 400 && err.status < 600 ? err.status : 500 }
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong on the server." }, { status: 500 });
  }
}