import { NextRequest, NextResponse } from "next/server";
import type { SourceProfile, InterestProfile } from "@/lib/types";
import { SAMPLE_INTEREST_PROFILES, FEATURED_INTEREST_PROFILES } from "@/lib/sample-data";

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

    if (!process.env.ANTHROPIC_API_KEY) {
      const username = profile.username.toLowerCase().replace(/^@/, "");
      const featuredProfile = FEATURED_INTEREST_PROFILES[username];
      return NextResponse.json({ interestProfile: featuredProfile ?? buildFallback(profile) });
    }

    try {
      const { analyzeProfile } = await import("@/lib/anthropic");
      const interestProfile = await analyzeProfile(profile);
      return NextResponse.json({ interestProfile });
    } catch (anthropicErr) {
      // Anthropic API の失敗は記録してフォールバックで続行
      const errMsg = anthropicErr instanceof Error ? anthropicErr.message : String(anthropicErr);
      console.error("Anthropic API error:", errMsg);

      // 注目ユーザーまたはサンプルの固有プロフィールを優先使用
      const username = profile.username.toLowerCase().replace(/^@/, "");
      const featuredProfile = FEATURED_INTEREST_PROFILES[username];
      const fallbackProfile = featuredProfile ?? buildFallback(profile);

      return NextResponse.json({
        interestProfile: fallbackProfile,
        anthropicError: errMsg,
      });
    }
  } catch (err) {
    console.error("Analyze API error:", err);
    return NextResponse.json(
      { error: "リクエストの解析に失敗しました。" },
      { status: 500 }
    );
  }
}
