// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { callModel, ChatMessage, ProviderError } from "@/lib/providers";
import { getModelById, DEFAULT_MODEL_ID } from "@/lib/models";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, modelId } = body as { messages: ChatMessage[]; modelId?: string };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    const model = getModelById(modelId || DEFAULT_MODEL_ID);
    if (!model) {
      return NextResponse.json({ error: "Unknown model id" }, { status: 400 });
    }

    const systemPrompt: ChatMessage = {
      role: "system",
      content:
        "You are a friendly, helpful AI assistant inside a chat app called HomeworkAI. " +
        "Be clear, concise, and use markdown formatting (lists, code blocks, bold) when it helps readability.",
    };

    const result = await callModel([systemPrompt, ...messages], model);
    return NextResponse.json({ reply: result.text, model: model.label });
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