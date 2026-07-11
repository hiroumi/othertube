import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { username?: string };
    const username = body.username?.trim();

    if (!username) {
      return NextResponse.json({ error: "ユーザー名が指定されていません。" }, { status: 400 });
    }

    if (!process.env.X_BEARER_TOKEN) {
      return NextResponse.json({ fallback: true, reason: "no_token" });
    }

    const { fetchXProfile } = await import("@/lib/twitter");
    const profile = await fetchXProfile(username);
    return NextResponse.json({ profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : "X APIの取得に失敗しました。";
    console.error("X API route error:", message);
    return NextResponse.json({ fallback: true, reason: "error", message });
  }
}
