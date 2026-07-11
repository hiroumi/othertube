import { NextRequest, NextResponse } from "next/server";
import type { YouTubeVideo, InterestProfile, RecommendedVideo } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      videos: YouTubeVideo[];
      interestProfile: InterestProfile;
      sourceChannelId?: string;
    };
    const { videos, interestProfile, sourceChannelId } = body;

    // YouTube source: exclude videos from the input channel itself
    const filteredVideos = sourceChannelId
      ? videos.filter((v) => v.channelId !== sourceChannelId)
      : videos;

    if (!filteredVideos || filteredVideos.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    // Claude APIがあれば高度なスコアリング、なければシンプルスコアリング
    if (process.env.ANTHROPIC_API_KEY && filteredVideos.length >= 3) {
      try {
        const { categorizeAndScoreVideos } = await import("@/lib/anthropic");
        const recommendations: RecommendedVideo[] = await categorizeAndScoreVideos(
          interestProfile,
          filteredVideos
        );
        return NextResponse.json({ recommendations });
      } catch {
        // Claude失敗時はフォールバック
      }
    }

    const { scoreAndCategorizeVideos } = await import("@/lib/scoring");
    const recommendations = scoreAndCategorizeVideos(filteredVideos, interestProfile);
    return NextResponse.json({ recommendations });
  } catch (err) {
    console.error("Recommend API error:", err);
    return NextResponse.json(
      { error: "推薦の生成中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}
