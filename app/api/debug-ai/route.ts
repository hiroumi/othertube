import { NextResponse } from "next/server";

export async function GET() {
  const credBase64 = (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64 ?? "").trim();
  const results: Record<string, string> = {
    vertex_creds: credBase64 ? `set (${credBase64.length} chars)` : "(not set)",
  };

  if (!credBase64) {
    return NextResponse.json(results);
  }

  const credentials = JSON.parse(Buffer.from(credBase64, "base64").toString("utf-8"));
  const projectId = process.env.GCP_PROJECT_ID ?? (credentials.project_id as string);
  results["sa_project"] = projectId ?? "(unknown)";
  results["sa_email"] = (credentials.client_email as string) ?? "(unknown)";

  // Test Vertex AI SDK (uses GCP credits)
  const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash-002", "gemini-1.5-flash"];
  for (const modelName of modelsToTry) {
    try {
      const { VertexAI } = await import("@google-cloud/vertexai");
      const vertex = new VertexAI({
        project: projectId,
        location: "us-central1",
        googleAuthOptions: { credentials },
      });
      const model = vertex.getGenerativeModel({ model: modelName });
      const r = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: "Reply: ok" }] }],
      });
      const text = r.response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      results[`vertex_${modelName}`] = `✅ ${text.trim().slice(0, 20)}`;
      break;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      results[`vertex_${modelName}`] = `❌ ${msg.slice(0, 120)}`;
    }
  }

  return NextResponse.json(results);
}
