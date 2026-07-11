import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "YOUTUBE_API_KEY not set" });

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", "お笑い芸人");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "3");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  const data = await res.json();

  return NextResponse.json({
    status: res.status,
    ok: res.ok,
    itemCount: data.items?.length ?? 0,
    error: data.error ?? null,
    firstItem: data.items?.[0]?.snippet?.title ?? null,
  });
}
