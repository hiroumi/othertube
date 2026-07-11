import type { XProfile } from "./twitter";

const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ---------------------------------------------------------------------------
// L1: In-memory cache
// Module-level Map persists across requests on the same warm serverless instance
// ---------------------------------------------------------------------------

interface MemEntry {
  profile: XProfile;
  cachedAt: number;
}

const memCache = new Map<string, MemEntry>();

function cacheKey(username: string) {
  return username.toLowerCase();
}

export function getMemCache(username: string): XProfile | null {
  const entry = memCache.get(cacheKey(username));
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > TTL_MS) {
    memCache.delete(cacheKey(username));
    return null;
  }
  return entry.profile;
}

export function setMemCache(username: string, profile: XProfile): void {
  memCache.set(cacheKey(username), { profile, cachedAt: Date.now() });
}

// ---------------------------------------------------------------------------
// L2: Supabase cache (optional — activated only when env vars are present)
//
// Required table (run once in Supabase SQL editor):
//   create table x_profile_cache (
//     username text primary key,
//     profile  jsonb not null,
//     cached_at timestamptz not null default now()
//   );
// ---------------------------------------------------------------------------

function getSupabaseConfig(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

export async function getSupabaseCache(username: string): Promise<XProfile | null> {
  const config = getSupabaseConfig();
  if (!config) return null;

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(config.url, config.key);

    const { data, error } = await supabase
      .from("x_profile_cache")
      .select("profile, cached_at")
      .eq("username", cacheKey(username))
      .maybeSingle();

    if (error || !data) return null;

    const age = Date.now() - new Date(data.cached_at as string).getTime();
    if (age > TTL_MS) return null;

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
    const supabase = createClient(config.url, config.key);

    await supabase.from("x_profile_cache").upsert(
      {
        username: cacheKey(username),
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
// ---------------------------------------------------------------------------

export async function getCachedProfile(username: string): Promise<XProfile | null> {
  return getMemCache(username) ?? (await getSupabaseCache(username));
}

export async function setCachedProfile(username: string, profile: XProfile): Promise<void> {
  setMemCache(username, profile);
  await setSupabaseCache(username, profile);
}
