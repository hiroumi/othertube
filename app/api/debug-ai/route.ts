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

  // Check if aiplatform.googleapis.com is enabled
  if (vertexToken) {
    try {
      const svcUrl = `https://serviceusage.googleapis.com/v1/projects/${projectId}/services/aiplatform.googleapis.com`;
      const svcRes = await fetch(svcUrl, { headers: { Authorization: `Bearer ${vertexToken}` } });
      if (svcRes.ok) {
        const data = (await svcRes.json()) as { state?: string };
        results["aiplatform_api"] = data.state === "ENABLED" ? "✅ ENABLED" : `⚠️ ${data.state ?? "UNKNOWN"}`;
      } else {
        results["aiplatform_api"] = `❌ ${svcRes.status}`;
      }
    } catch (e) {
      results["aiplatform_api"] = `❌ ${e instanceof Error ? e.message.slice(0, 60) : String(e)}`;
    }
  }

  // List available Gemini models in Vertex AI
  if (vertexToken) {
    try {
      const listUrl = `https://us-central1-aiplatform.googleapis.com/v1/publishers/google/models?pageSize=5`;
      const listRes = await fetch(listUrl, {
        headers: { Authorization: `Bearer ${vertexToken}` },
      });
      if (listRes.ok) {
        type M = { publisherModels?: Array<{ name: string }> };
        const data = (await listRes.json()) as M;
        const names = (data.publisherModels ?? []).map((m) => m.name.split("/").pop()).join(", ");
        results["available_models"] = names || "(none listed)";
      } else {
        const err = await listRes.text();
        results["available_models"] = `❌ ${listRes.status}: ${err.slice(0, 120)}`;
      }
    } catch (e) {
      results["available_models"] = `❌ ${e instanceof Error ? e.message.slice(0, 80) : String(e)}`;
    }

    // Try different regions and model names
    const attempts = [
      { region: "us-central1", model: "gemini-2.0-flash" },
      { region: "us-east4",    model: "gemini-2.0-flash" },
      { region: "us-central1", model: "gemini-1.5-flash" },
      { region: "us-central1", model: "gemini-1.5-flash-002" },
    ];
    for (const { region, model } of attempts) {
      const key = `${region}/${model}`;
      try {
        const url = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/${model}:generateContent`;
        const res = await fetch(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${vertexToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Reply: ok" }] }] }),
        });
        if (res.ok) {
          type R = { candidates: Array<{ content: { parts: Array<{ text: string }> } }> };
          const data = (await res.json()) as R;
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
          results[key] = `✅ ${text.trim().slice(0, 20)}`;
          break;
        } else {
          const err = await res.text();
          results[key] = `❌ ${res.status}: ${err.slice(0, 100)}`;
        }
      } catch (e) {
        results[key] = `❌ ${e instanceof Error ? e.message.slice(0, 60) : String(e)}`;
      }
    }
  }

  return NextResponse.json(results);
}
