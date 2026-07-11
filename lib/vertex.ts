import { GoogleAuth } from "google-auth-library";
import type { SourceProfile, InterestProfile, YouTubeVideo, RecommendedVideo, RecommendationCategory } from "./types";

const VERTEX_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
const VERTEX_REGION = "us-central1";

function getAuth() {
  const base64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
  if (!base64) throw new Error("GOOGLE_APPLICATION_CREDENTIALS_BASE64 is not set");
  const credentials = JSON.parse(Buffer.from(base64, "base64").toString("utf-8"));
  const projectId = process.env.GCP_PROJECT_ID ?? (credentials.project_id as string);
  if (!projectId) throw new Error("GCP_PROJECT_ID not found");
  return { auth: new GoogleAuth({ credentials, scopes: ["https://www.googleapis.com/auth/cloud-platform"] }), projectId };
}

async function generate(prompt: string): Promise<string> {
  const { auth, projectId } = getAuth();
  const token = await auth.getAccessToken();
  if (!token) throw new Error("Failed to get access token");

  let lastError: Error = new Error("No models available");
  for (const model of VERTEX_MODELS) {
    const url = `https://${VERTEX_REGION}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${VERTEX_REGION}/publishers/google/models/${model}:generateContent`;
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
    });
    if (res.ok) {
      type Part = { text?: string; thought?: boolean };
      type R = { candidates: Array<{ content: { parts: Array<Part> } }> };
      const data = (await res.json()) as R;
      const parts = data.candidates?.[0]?.content?.parts ?? [];
      // Skip thinking parts (thought: true) and get the actual response text
      const textPart = parts.find((p) => !p.thought && p.text) ?? parts[parts.length - 1];
      const text = textPart?.text ?? "";
      if (text) return text;
      lastError = new Error("Empty response");
    } else {
      const err = await res.text();
      lastError = new Error(`Vertex AI ${res.status} (${model}): ${err.slice(0, 200)}`);
    }
  }
  throw lastError;
}

export async function analyzeProfile(profile: SourceProfile): Promise<InterestProfile> {
  const effectivePosts = profile.posts.length > 0
    ? profile.posts
    : profile.bio ? [profile.bio] : [];

  const postsText = effectivePosts.length > 0
    ? effectivePosts.map((p, i) => `${i + 1}. ${p}`).join("\n")
    : "(情報なし — プロフィール情報のみで推定)";

  const isYouTube = profile.source === "youtube";

  const prompt = isYouTube
    ? `You are analyzing a YouTube creator's channel to understand the themes, interests, and perspective expressed through their content.

Channel:
- Handle: @${profile.username}
- Channel Name: ${profile.displayName ?? profile.username}
- Description: ${profile.bio ?? "No description available"}

Recent Video Titles and Descriptions:
${postsText}

Based on this creator's content, generate an interest profile. The goal is to discover what OTHER YouTube videos (from different channels) this creator's audience would enjoy.

Return ONLY valid JSON with no additional text or markdown.

{
  "displayName": "string - channel name",
  "summary": "string - 1-2 sentences in Japanese describing this creator's themes and perspective",
  "interests": ["array of 4-6 interest topics in Japanese"],
  "perspective": "string - 1-2 sentences in Japanese describing this creator's worldview",
  "keywords": ["array of 4-6 keywords"],
  "language": "ISO 639-1 code detected from content (e.g. 'ja', 'en')",
  "youtubeSearchQueries": ["array of 4-5 search queries in the creator's primary language to find content FROM OTHER CHANNELS"]
}`
    : `You are analyzing a person's public X (Twitter) profile and posts to understand their interests and perspective.

Profile:
- Username: @${profile.username}
- Display Name: ${profile.displayName ?? profile.username}
- Bio: ${profile.bio ?? "No bio available"}

Recent Posts:
${postsText}

Based on this public information, generate an interest profile as a JSON object. Return ONLY valid JSON with no additional text or markdown.

{
  "displayName": "string - their display name or username",
  "summary": "string - 1-2 sentences in Japanese describing their interests and perspective",
  "interests": ["array of 4-6 interest topics in Japanese"],
  "perspective": "string - 1-2 sentences in Japanese describing how they view the world",
  "keywords": ["array of 4-6 keywords"],
  "language": "ISO 639-1 code detected from their posts (e.g. 'ja', 'en')",
  "youtubeSearchQueries": ["array of 4-5 YouTube search queries in the user's primary language"]
}`;

  const text = await generate(prompt);
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in response");
  return JSON.parse(jsonMatch[0]) as InterestProfile;
}

export async function categorizeAndScoreVideos(
  interestProfile: InterestProfile,
  videos: YouTubeVideo[]
): Promise<RecommendedVideo[]> {
  if (videos.length === 0) return [];

  const videoList = videos
    .map(
      (v, i) =>
        `${i + 1}. Title: "${v.title}" | Channel: ${v.channelTitle} | Description: ${v.description.slice(0, 100)}`
    )
    .join("\n");

  const prompt = `You are recommending YouTube videos for someone with this interest profile:
- Summary: ${interestProfile.summary}
- Interests: ${interestProfile.interests.join(", ")}
- Perspective: ${interestProfile.perspective}

Available videos:
${videoList}

For each video, assign:
- category: "core" (directly matches interests), "adjacent" (related but broader), or "opposite" (different perspective)
- reason: 1-2 sentences in Japanese explaining why this video is recommended
- relevanceScore: 0-100 integer
- serendipityScore: 0-100 integer

Select up to 10 core, 10 adjacent, 10 opposite (total up to 30).
Return ONLY a valid JSON array with no additional text or markdown:
[
  {
    "videoIndex": number,
    "category": "core"|"adjacent"|"opposite",
    "reason": "Japanese string",
    "relevanceScore": number,
    "serendipityScore": number
  }
]`;

  const text = await generate(prompt);
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("No JSON array found in response");

  type ScoreEntry = {
    videoIndex: number;
    category: RecommendationCategory;
    reason: string;
    relevanceScore: number;
    serendipityScore: number;
  };

  const scored = JSON.parse(jsonMatch[0]) as ScoreEntry[];
  return scored
    .filter((s) => s.videoIndex >= 1 && s.videoIndex <= videos.length)
    .map((s) => ({
      ...videos[s.videoIndex - 1],
      category: s.category,
      reason: s.reason,
      relevanceScore: s.relevanceScore,
      serendipityScore: s.serendipityScore,
    }));
}
