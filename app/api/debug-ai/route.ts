import { NextResponse } from "next/server";

export async function GET() {
  const googleKey = process.env.GOOGLE_AI_API_KEY ?? "";
  const anthropicKey = process.env.ANTHROPIC_API_KEY ?? "";

  const results: Record<string, string> = {
    anthropic_key: anthropicKey ? `set (${anthropicKey.slice(0, 12)}...)` : "not set",
    google_key: googleKey ? `set (${googleKey.slice(0, 12)}...)` : "not set",
    google_key_length: String(googleKey.length),
    google_key_starts_with: googleKey.slice(0, 4),
    supabase_url: process.env.SUPABASE_URL ? "set" : "not set",
  };

  if (googleKey) {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(googleKey.trim());
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const r = await model.generateContent("Reply with just the word: ok");
      results.gemini_test = `success: ${r.response.text().trim().slice(0, 30)}`;
    } catch (e) {
      results.gemini_test = `error: ${e instanceof Error ? e.message : String(e)}`;
    }

    // モデル名を変えて再試行
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(googleKey.trim());
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const r = await model.generateContent("Reply with just the word: ok");
      results.gemini_2flash_test = `success: ${r.response.text().trim().slice(0, 30)}`;
    } catch (e) {
      results.gemini_2flash_test = `error: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  return NextResponse.json(results);
}
