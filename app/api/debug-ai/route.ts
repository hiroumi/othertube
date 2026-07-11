import { NextResponse } from "next/server";

export async function GET() {
  const googleKey = (process.env.GOOGLE_AI_API_KEY ?? "").trim();
  const credBase64 = (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64 ?? "").trim();

  const results: Record<string, string> = {
    google_key_prefix: googleKey ? googleKey.slice(0, 8) : "(not set)",
    vertex_creds: credBase64 ? `set (${credBase64.length} chars)` : "(not set)",
  };

  // Gemini AI Studio test
  if (googleKey) {
    for (const modelName of ["gemini-2.0-flash", "gemini-2.0-flash-lite"]) {
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(googleKey);
        const model = genAI.getGenerativeModel({ model: modelName });
        const r = await model.generateContent("Reply: ok");
        results[`aistudio_${modelName}`] = `✅ ${r.response.text().trim().slice(0, 20)}`;
        break;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        results[`aistudio_${modelName}`] = `❌ ${msg.slice(0, 100)}`;
      }
    }
  }

  // Vertex AI test
  if (credBase64) {
    try {
      const credentials = JSON.parse(Buffer.from(credBase64, "base64").toString("utf-8"));
      const projectId = process.env.GCP_PROJECT_ID ?? (credentials.project_id as string);
      results["vertex_project"] = projectId ?? "(unknown)";

      const { VertexAI } = await import("@google-cloud/vertexai");
      const vertex = new VertexAI({
        project: projectId,
        location: "us-central1",
        googleAuthOptions: { credentials },
      });
      const model = vertex.getGenerativeModel({ model: "gemini-2.0-flash-001" });
      const r = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: "Reply: ok" }] }],
      });
      const text = r.response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      results["vertex_gemini-2.0-flash"] = `✅ ${text.trim().slice(0, 20)}`;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      results["vertex_gemini-2.0-flash"] = `❌ ${msg.slice(0, 150)}`;
    }
  }

  return NextResponse.json(results);
}
