import { NextResponse } from "next/server";

export async function GET() {
  const googleKey = (process.env.GOOGLE_AI_API_KEY ?? "").trim();

  const results: Record<string, string> = {
    google_key_prefix: googleKey.slice(0, 8),
    google_key_length: String(googleKey.length),
  };

  const modelsToTry = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest",
  ];

  for (const modelName of modelsToTry) {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(googleKey);
      const model = genAI.getGenerativeModel({ model: modelName });
      const r = await model.generateContent("Reply: ok");
      results[modelName] = `✅ ${r.response.text().trim().slice(0, 20)}`;
      break; // 成功したら終了
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const short = msg.includes("[") ? msg.split("]")[0].replace("[GoogleGenerativeAI Error]: Error fetching from ", "").slice(-60) : msg.slice(0, 80);
      results[modelName] = `❌ ${short}`;
    }
  }

  return NextResponse.json(results);
}
