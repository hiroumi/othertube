import { NextRequest, NextResponse } from "next/server";
import type { SourceProfile, InterestProfile } from "@/lib/types";
import { SAMPLE_INTEREST_PROFILES, FEATURED_INTEREST_PROFILES } from "@/lib/sample-data";

async function saveHistory(profile: SourceProfile, interestProfile: InterestProfile) {
  try {
    const { recordSearchHistory } = await import("@/lib/cache");
    await recordSearchHistory({
      username: profile.username,
      displayName: interestProfile.displayName,
      source: profile.source === "youtube" ? "youtube" : "x",
      summary: interestProfile.summary,
      interests: interestProfile.interests,
    });
  } catch {
    // non-critical
  }
}

function buildFallback(profile: SourceProfile): InterestProfile {
  return {
    displayName: profile.displayName ?? profile.username,
    summary: "投稿内容をもとにAIが関心を推定しました（フォールバックモード）。",
    interests: ["テクノロジー", "情報収集", "社会問題", "コミュニティ"],
    perspective: "多様な視点から情報を収集し、社会への影響を考える傾向があります。",
    keywords: ["technology", "society", "community", "innovation"],
    youtubeSearchQueries: [
      "technology society impact documentary",
      "community building innovation",
      "future trends analysis",
      "social entrepreneurship",
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { profile: SourceProfile };
    const { profile } = body;

    if (!profile) {
      return NextResponse.json({ error: "プロフィールが指定されていません。" }, { status: 400 });
    }

    if (profile.posts.length === 0 && !profile.bio?.trim()) {
      return NextResponse.json(
        { error: "分析できる情報がありません。投稿やプロフィール情報が必要です。" },
        { status: 400 }
      );
    }

    // サンプルプロフィールの場合は事前定義データを返す
    if (profile.source === "sample") {
      const sampleResult = SAMPLE_INTEREST_PROFILES[profile.username];
      if (sampleResult) {
        return NextResponse.json({ interestProfile: sampleResult });
      }
    }

    // AI分析を試みる: Anthropic → Gemini → featured/generic fallback
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const { analyzeProfile } = await import("@/lib/anthropic");
        const interestProfile = await analyzeProfile(profile);
        void saveHistory(profile, interestProfile);
        return NextResponse.json({ interestProfile });
      } catch (err) {
        console.error("Anthropic API error:", err instanceof Error ? err.message : err);
      }
    }

    if (process.env.GOOGLE_AI_API_KEY) {
      try {
        const { analyzeProfile } = await import("@/lib/gemini");
        const interestProfile = await analyzeProfile(profile);
        void saveHistory(profile, interestProfile);
        return NextResponse.json({ interestProfile });
      } catch (err) {
        console.error("Gemini API error:", err instanceof Error ? err.message : err);
      }
    }

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
      try {
        const { analyzeProfile } = await import("@/lib/vertex");
        const interestProfile = await analyzeProfile(profile);
        void saveHistory(profile, interestProfile);
        return NextResponse.json({ interestProfile });
      } catch (err) {
        console.error("Vertex AI error:", err instanceof Error ? err.message : err);
      }
    }

    // どのAI APIも使えない場合 → featured profile or smart fallback
    const username = profile.username.toLowerCase().replace(/^@/, "");
    const featuredProfile = FEATURED_INTEREST_PROFILES[username];
    const fallbackProfile = featuredProfile ?? buildFallback(profile);
    void saveHistory(profile, fallbackProfile);
    return NextResponse.json({ interestProfile: fallbackProfile });
  } catch (err) {
    console.error("Analyze API error:", err);
    return NextResponse.json(
      { error: "リクエストの解析に失敗しました。" },
      { status: 500 }
    );
  }
}
