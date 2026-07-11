import { NextResponse } from "next/server";

export async function GET() {
  const googleKey = (process.env.GOOGLE_AI_API_KEY ?? "").trim();
  const credBase64 = (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64 ?? "").trim();

  const results: Record<string, string> = {
    google_key_prefix: googleKey ? googleKey.slice(0, 8) : "(not set)",
    vertex_creds: credBase64 ? `set (${credBase64.length} chars)` : "(not set)",
  };

  // AI Studio key test
  if (googleKey) {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(googleKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const r = await model.generateContent("Reply: ok");
      results["aistudio"] = `✅ ${r.response.text().trim().slice(0, 20)}`;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      results["aistudio"] = `❌ ${msg.slice(0, 120)}`;
    }
  }

  // Service account → Gemini API (generativelanguage.googleapis.com)
  if (credBase64) {
    try {
      const credentials = JSON.parse(Buffer.from(credBase64, "base64").toString("utf-8"));
      results["sa_project"] = (credentials.project_id as string) ?? "(unknown)";
      results["sa_email"] = (credentials.client_email as string) ?? "(unknown)";

      const { GoogleAuth } = await import("google-auth-library");
      const auth = new GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/generative-language"],
      });
      const token = await auth.getAccessToken();
      if (!token) throw new Error("No access token returned");

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Reply: ok" }] }] }),
        }
      );

      if (!response.ok) {
        const err = await response.text();
        results["sa_gemini"] = `❌ ${response.status}: ${err.slice(0, 150)}`;
      } else {
        type R = { candidates: Array<{ content: { parts: Array<{ text: string }> } }> };
        const data = (await response.json()) as R;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        results["sa_gemini"] = `✅ ${text.trim().slice(0, 20)}`;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      results["sa_gemini"] = `❌ ${msg.slice(0, 150)}`;
    }
  }

  return NextResponse.json(results);
}
