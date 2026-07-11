import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);
    const offset = parseInt(searchParams.get("offset") ?? "0");

    const { getRecentSearches } = await import("@/lib/cache");
    const entries = await getRecentSearches(limit, offset);
    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json({ entries: [] });
  }
}
