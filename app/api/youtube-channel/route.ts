import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { channelInput?: string };
    const channelInput = body.channelInput?.trim();

    if (!channelInput) {
      return NextResponse.json(
        { error: "チャンネルURLまたは@ハンドルを入力してください。" },
        { status: 400 }
      );
    }

    if (!process.env.YOUTUBE_API_KEY) {
      return NextResponse.json({ fallback: true, reason: "no_key" });
    }

    const { fetchYouTubeChannelInfo } = await import("@/lib/youtube-channel");
    const channelInfo = await fetchYouTubeChannelInfo(channelInput);

    return NextResponse.json({ channelInfo });
  } catch (err) {
    const message = err instanceof Error ? err.message : "チャンネルの取得に失敗しました。";
    console.error("YouTube channel route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
