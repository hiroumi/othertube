import type { XProfile } from "./twitter";

const TTL_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Username normalization
// @10000nabe / https://x.com/10000nabe / 10000nabe → "10000nabe"
// ---------------------------------------------------------------------------

export function normalizeUsername(raw: string): string {
  const urlMatch = raw.match(/(?:x\.com|twitter\.com)\/([A-Za-z0-9_]+)/);
  if (urlMatch) return urlMatch[1].toLowerCase();
  return raw.replace(/^@/, "").replace(/\/$/, "").trim().toLowerCase();
}

// ---------------------------------------------------------------------------
// L1: In-memory cache
// "あればラッキー" 程度。Vercelの同一ウォームインスタンス内のみ有効。
// L2 Supabase が実質的な正規キャッシュ。
// ---------------------------------------------------------------------------

interface MemEntry {
  profile: XProfile;
  cachedAt: number;
}

const memCache = new Map<string, MemEntry>();

export function getMemCache(username: string): XProfile | null {
  const key = normalizeUsername(username);
  const entry = memCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > TTL_MS) {
    memCache.delete(key);
    return null;
  }
  return entry.profile;
}

export function setMemCache(username: string, profile: XProfile): void {
  memCache.set(normalizeUsername(username), { profile, cachedAt: Date.now() });
}

// ---------------------------------------------------------------------------
// L2: Supabase cache
// SUPABASE_SERVICE_ROLE_KEY はサーバー専用（NEXT_PUBLIC_ 禁止）。
// RLSを回避できる強いキーのため、絶対にブラウザへ渡さない。
//
// 必要なテーブル（Supabase SQL Editor で一度だけ実行）:
//   create table x_profile_cache (
//     username  text primary key,
//     profile   jsonb not null,
//     cached_at timestamptz not null default now()
//   );
//   create index x_profile_cache_cached_at_idx
//     on x_profile_cache (cached_at);
// ---------------------------------------------------------------------------

function getSupabaseConfig(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

export async function getSupabaseCache(username: string): Promise<XProfile | null> {
  const config = getSupabaseConfig();
  if (!config) return null;

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(config.url, config.key, {
      auth: { persistSession: false },
    });

    const cutoff = new Date(Date.now() - TTL_MS).toISOString();

    const { data, error } = await supabase
      .from("x_profile_cache")
      .select("profile, cached_at")
      .eq("username", normalizeUsername(username))
      .gte("cached_at", cutoff)
      .maybeSingle();

    if (error || !data) return null;
    return data.profile as XProfile;
  } catch {
    return null;
  }
}

export async function setSupabaseCache(username: string, profile: XProfile): Promise<void> {
  const config = getSupabaseConfig();
  if (!config) return;

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(config.url, config.key, {
      auth: { persistSession: false },
    });

    await supabase.from("x_profile_cache").upsert(
      {
        username: normalizeUsername(username),
        profile,
        cached_at: new Date().toISOString(),
      },
      { onConflict: "username" }
    );
  } catch {
    // キャッシュ書き込み失敗は無視してフローを続行
  }
}

// ---------------------------------------------------------------------------
// Search history (search_history table)
// 誰がどのアカウントを検索したかを記録。ホームページの「最近検索」に使用。
//
// Supabase SQL Editor で一度だけ実行:
//   create table search_history (
//     id          bigserial primary key,
//     username    text not null,
//     display_name text,
//     source      text not null default 'x',
//     summary     text,
//     interests   jsonb,
//     searched_at timestamptz not null default now(),
//     unique (username, source)
//   );
//   create index search_history_searched_at_idx on search_history (searched_at desc);
// ---------------------------------------------------------------------------

export interface SearchHistoryEntry {
  username: string;
  displayName?: string;
  source: "x" | "youtube";
  summary?: string;
  interests?: string[];
  searchedAt: string;
}

export async function recordSearchHistory(
  entry: Omit<SearchHistoryEntry, "searchedAt">
): Promise<void> {
  const config = getSupabaseConfig();
  if (!config) return;

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(config.url, config.key, {
      auth: { persistSession: false },
    });

    await supabase.from("search_history").upsert(
      {
        username: entry.username,
        display_name: entry.displayName,
        source: entry.source,
        summary: entry.summary,
        interests: entry.interests ?? [],
        searched_at: new Date().toISOString(),
      },
      { onConflict: "username,source" }
    );
  } catch {
    // non-critical
  }
}

export async function getRecentSearches(
  limit = 20,
  offset = 0
): Promise<SearchHistoryEntry[]> {
  const config = getSupabaseConfig();
  if (!config) return [];

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(config.url, config.key, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase
      .from("search_history")
      .select("username, display_name, source, summary, interests, searched_at")
      .order("searched_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error || !data) return [];

    return data.map((row) => ({
      username: row.username as string,
      displayName: row.display_name as string | undefined,
      source: row.source as "x" | "youtube",
      summary: row.summary as string | undefined,
      interests: row.interests as string[] | undefined,
      searchedAt: row.searched_at as string,
    }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// YouTube search cache (youtube_cache table)
// クォータ節約のため、同じクエリの検索結果を24時間キャッシュする。
//
// Supabase SQL Editor で一度だけ実行:
//   create table youtube_cache (
//     id         bigserial primary key,
//     query_key  text not null unique,
//     videos     jsonb not null,
//     created_at timestamptz not null default now()
//   );
//   create index youtube_cache_created_at_idx on youtube_cache (created_at desc);
// ---------------------------------------------------------------------------

export async function getCachedYouTubeVideos(queryKey: string): Promise<unknown[] | null> {
  const config = getSupabaseConfig();
  if (!config) return null;

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(config.url, config.key, { auth: { persistSession: false } });
    const cutoff = new Date(Date.now() - TTL_MS).toISOString();

    const { data, error } = await supabase
      .from("youtube_cache")
      .select("videos")
      .eq("query_key", queryKey)
      .gte("created_at", cutoff)
      .maybeSingle();

    if (error || !data) return null;
    return data.videos as unknown[];
  } catch {
    return null;
  }
}

export async function setCachedYouTubeVideos(queryKey: string, videos: unknown[]): Promise<void> {
  const config = getSupabaseConfig();
  if (!config) return;

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(config.url, config.key, { auth: { persistSession: false } });

    await supabase.from("youtube_cache").upsert(
      { query_key: queryKey, videos, created_at: new Date().toISOString() },
      { onConflict: "query_key" }
    );
  } catch {
    // non-critical
  }
}

// ---------------------------------------------------------------------------
// Unified helpers
// Supabase が設定されている場合は正本（source of truth）として扱う。
// L1（メモリ）は Supabase 不在時の補助のみ。
// これにより Supabase 側で DELETE した際に L1 の古いデータが使われる問題を防ぐ。
// ---------------------------------------------------------------------------

export async function getCachedProfile(username: string): Promise<XProfile | null> {
  if (getSupabaseConfig()) {
    // Supabase が設定されている → 正本として確認
    const db = await getSupabaseCache(username);
    if (db) {
      setMemCache(username, db);
      return db;
    }
    // Supabase にない = 削除された or 期限切れ → L1 の古いデータも破棄
    memCache.delete(normalizeUsername(username));
    return null;
  }

  // Supabase 未設定 → L1 のみ使用
  return getMemCache(username);
}

export async function setCachedProfile(username: string, profile: XProfile): Promise<void> {
  setMemCache(username, profile);
  await setSupabaseCache(username, profile);
}
