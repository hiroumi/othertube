import { NextResponse } from "next/server";

export async function GET() {
  const results: Record<string, string> = {
    anthropic_key: process.env.ANTHROPIC_API_KEY ? "set" : "not set",
    google_key: process.env.GOOGLE_AI_API_KEY ? "set" : "not set",
    supabase_url: process.env.SUPABASE_URL ? "set" : "not set",
  };

  // Gemini の疎通確認
  if (process.env.GOOGLE_AI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const r = await model.generateContent("Reply with just: ok");
      results.gemini_test = r.response.text().trim().slice(0, 20);
    } catch (e) {
      results.gemini_test = `error: ${e instanceof Error ? e.message.slice(0, 80) : String(e)}`;
    }
  } else {
    results.gemini_test = "skipped (no key)";
  }

  return NextResponse.json(results);
}
