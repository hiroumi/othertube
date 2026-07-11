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
// Unified helpers
// L1（メモリ）→ L2（Supabase）→ X API の順で使う
// ---------------------------------------------------------------------------

export async function getCachedProfile(username: string): Promise<XProfile | null> {
  const mem = getMemCache(username);
  if (mem) return mem;

  const db = await getSupabaseCache(username);
  if (db) {
    setMemCache(username, db); // L2ヒット時はL1にも保存
    return db;
  }

  return null;
}

export async function setCachedProfile(username: string, profile: XProfile): Promise<void> {
  setMemCache(username, profile);
  await setSupabaseCache(username, profile);
}
