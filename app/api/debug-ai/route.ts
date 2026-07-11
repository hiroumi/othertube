import { NextResponse } from "next/server";

export async function GET() {
  const credBase64 = (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64 ?? "").trim();
  const results: Record<string, string> = {
    vertex_creds: credBase64 ? `set (${credBase64.length} chars)` : "(not set)",
  };

  if (!credBase64) return NextResponse.json(results);

  const credentials = JSON.parse(Buffer.from(credBase64, "base64").toString("utf-8"));
  const projectId = process.env.GCP_PROJECT_ID ?? (credentials.project_id as string);
  results["sa_project"] = projectId ?? "(unknown)";

  // Get OAuth token with cloud-platform scope (for Vertex AI)
  let vertexToken = "";
  try {
    const { GoogleAuth } = await import("google-auth-library");
    const auth = new GoogleAuth({ credentials, scopes: ["https://www.googleapis.com/auth/cloud-platform"] });
    vertexToken = (await auth.getAccessToken()) ?? "";
    results["vertex_token"] = vertexToken ? `✅ obtained (${vertexToken.length} chars)` : "❌ empty";
  } catch (e) {
    results["vertex_token"] = `❌ ${e instanceof Error ? e.message : String(e)}`;
  }

  // Direct REST call to Vertex AI
  if (vertexToken) {
    const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash-002", "gemini-1.5-flash"];
    for (const modelName of modelsToTry) {
      try {
        const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${modelName}:generateContent`;
        const res = await fetch(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${vertexToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Reply: ok" }] }] }),
        });
        if (res.ok) {
          type R = { candidates: Array<{ content: { parts: Array<{ text: string }> } }> };
          const data = (await res.json()) as R;
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
          results[`vertex_rest_${modelName}`] = `✅ ${text.trim().slice(0, 20)}`;
          break;
        } else {
          const err = await res.text();
          results[`vertex_rest_${modelName}`] = `❌ ${res.status}: ${err.slice(0, 120)}`;
        }
      } catch (e) {
        results[`vertex_rest_${modelName}`] = `❌ ${e instanceof Error ? e.message.slice(0, 80) : String(e)}`;
      }
    }
  }

  return NextResponse.json(results);
}
