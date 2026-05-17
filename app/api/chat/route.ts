import { NextRequest, NextResponse } from "next/server";
import { NIM_MODELS, nimChat, type NIMMessage } from "@/lib/nim";

export const runtime = "nodejs";
export const maxDuration = 45;

const SYSTEM = `You are "Dr Crops", an AI agronomy assistant for Pakistani farmers. Be warm, practical, and concise. Always:
- Match the farmer's language (Urdu, Punjabi-Shahmukhi, Sindhi, Pashto, Saraiki, English).
- Quote doses per acre and prices in PKR where useful.
- Reference Pakistani crop varieties (Galaxy-2013, IRRI-6, Basmati-515, BT cotton, etc) when relevant.
- If asked something outside agriculture, politely decline.`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      messages: NIMMessage[];
      lang?: string;
    };
    if (!body?.messages?.length) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }
    const reply = await nimChat({
      model: NIM_MODELS.llmChat,
      temperature: 0.4,
      max_tokens: 700,
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "system",
          content: `Respond in language code: ${body.lang ?? "en"}.`
        },
        ...body.messages
      ]
    });
    return NextResponse.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
