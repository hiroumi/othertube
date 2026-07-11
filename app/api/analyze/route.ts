import { NextRequest, NextResponse } from "next/server";
import type { SourceProfile, InterestProfile } from "@/lib/types";
import { SAMPLE_INTEREST_PROFILES } from "@/lib/sample-data";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { profile: SourceProfile };
    const { profile } = body;

    if (!profile || profile.posts.length === 0) {
      return NextResponse.json({ error: "投稿内容が空です。" }, { status: 400 });
    }

    // サンプルプロフィールの場合は事前定義データを返す
    if (profile.source === "sample") {
      const sampleResult = SAMPLE_INTEREST_PROFILES[profile.username];
      if (sampleResult) {
        return NextResponse.json({ interestProfile: sampleResult });
      }
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      // APIキーなし時はシンプルなフォールバック
      const fallback: InterestProfile = {
        displayName: profile.displayName ?? profile.username,
        summary: "投稿内容をもとにAIが関心を推定しました（デモモード）。",
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
      return NextResponse.json({ interestProfile: fallback });
    }

    const { analyzeProfile } = await import("@/lib/anthropic");
    const interestProfile = await analyzeProfile(profile);
    return NextResponse.json({ interestProfile });
  } catch (err) {
    console.error("Analyze API error:", err);
    return NextResponse.json(
      { error: "プロフィール分析中にエラーが発生しました。デモモードで続行できます。" },
      { status: 500 }
    );
  }
}
