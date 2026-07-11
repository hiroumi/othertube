import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { username?: string };
    const raw = body.username?.trim();

    if (!raw) {
      return NextResponse.json({ error: "ユーザー名が指定されていません。" }, { status: 400 });
    }

    const { normalizeUsername, getCachedProfile, setCachedProfile } = await import("@/lib/cache");
    const username = normalizeUsername(raw);

    // L1（メモリ）→ L2（Supabase）の順にキャッシュを確認
    const cached = await getCachedProfile(username);
    if (cached) {
      return NextResponse.json({ profile: cached, cached: true });
    }

    // キャッシュミス：X APIが利用可能か確認
    if (!process.env.X_BEARER_TOKEN) {
      return NextResponse.json({ fallback: true, reason: "no_token" });
    }

    // X API呼び出し
    const { fetchXProfile } = await import("@/lib/twitter");
    const profile = await fetchXProfile(username);

    // 取得したプロフィールをキャッシュに保存（エラーは無視）
    await setCachedProfile(username, profile);

    return NextResponse.json({ profile, cached: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "X APIの取得に失敗しました。";
    console.error("X API route error:", message);
    return NextResponse.json({ fallback: true, reason: "error", message });
  }
}
