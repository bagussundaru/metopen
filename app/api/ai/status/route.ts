import { NextResponse } from "next/server";
import { isAiConfigured, getGeminiModel } from "@/lib/ai/gemini-client";

export async function GET() {
  const configured = isAiConfigured();
  return NextResponse.json({
    enabled: configured,
    model: configured ? getGeminiModel() : null,
    rateLimitPerHour: parseInt(process.env.AI_RATE_LIMIT_PER_HOUR || "30", 10),
  });
}
