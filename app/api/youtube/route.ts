import { NextRequest, NextResponse } from "next/server";
import type { YouTubeVideo } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { queries: string[]; language?: string };
    const { queries, language } = body;

    if (!queries || queries.length === 0) {
      return NextResponse.json({ videos: [], debug: "no_queries" });
    }

    // Cache key: sorted queries joined so order doesn't matter
    const cacheKey = [...queries].sort().join("|");

    const { getCachedYouTubeVideos, setCachedYouTubeVideos } = await import("@/lib/cache");

    const cached = await getCachedYouTubeVideos(cacheKey);
    if (cached && cached.length > 0) {
      return NextResponse.json({ videos: cached, cached: true });
    }

    if (!process.env.YOUTUBE_API_KEY) {
      return NextResponse.json({ videos: [], fallback: true, debug: "no_api_key" });
    }

    const { searchYouTubeVideos } = await import("@/lib/youtube");
    const videos: YouTubeVideo[] = await searchYouTubeVideos(queries, { language });

    if (videos.length === 0) {
      return NextResponse.json({ videos: [], debug: `empty_results_for: ${queries[0]}` });
    }

    // Save to cache (non-blocking)
    setCachedYouTubeVideos(cacheKey, videos).catch(() => {});

    return NextResponse.json({ videos });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ videos: [], fallback: true, debug: `error: ${msg.slice(0, 100)}` });
  }
}
