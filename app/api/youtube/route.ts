import { NextRequest, NextResponse } from "next/server";
import type { YouTubeVideo } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { queries: string[]; language?: string };
    const { queries, language } = body;

    if (!queries || queries.length === 0) {
      return NextResponse.json({ videos: [] });
    }

    if (!process.env.YOUTUBE_API_KEY) {
      return NextResponse.json({ videos: [], fallback: true });
    }

    const { searchYouTubeVideos } = await import("@/lib/youtube");
    const videos: YouTubeVideo[] = await searchYouTubeVideos(queries, { language });
    return NextResponse.json({ videos });
  } catch (err) {
    console.error("YouTube API error:", err);
    return NextResponse.json({ videos: [], fallback: true });
  }
}
