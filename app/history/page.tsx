import Link from "next/link";
import { Play, AtSign, PlaySquare, ChevronLeft, Clock, Users } from "lucide-react";
import { getRecentSearches } from "@/lib/cache";

export const revalidate = 30;

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return "たった今";
  if (m < 60) return `${m}分前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}時間前`;
  return `${Math.floor(h / 24)}日前`;
}

export default async function HistoryPage() {
  const entries = await getRecentSearches(50);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-gray-100 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            ホーム
          </Link>
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4 fill-red-500 text-red-500" />
            <span className="text-base font-bold text-gray-900">
              Other<span className="text-red-500">Tube</span>
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
              <Users className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">最近検索されたアカウント</h1>
              <p className="text-sm text-gray-500">
                みんながどんなアカウントで試しているか見てみよう
              </p>
            </div>
          </div>

          {entries.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center">
              <p className="text-gray-400">まだ検索履歴がありません</p>
              <Link
                href="/"
                className="mt-4 inline-block text-sm text-red-500 hover:text-red-600"
              >
                最初に試してみる →
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {entries.map((entry) => (
                <Link
                  key={`${entry.source}:${entry.username}`}
                  href={`/?q=${encodeURIComponent(entry.username)}&source=${entry.source}`}
                  className="group rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-orange-300 hover:shadow-md"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-800">
                        {entry.displayName ?? entry.username}
                      </p>
                      <p
                        className={`flex items-center gap-0.5 text-xs ${
                          entry.source === "youtube" ? "text-red-500" : "text-sky-500"
                        }`}
                      >
                        {entry.source === "youtube" ? (
                          <PlaySquare className="h-3 w-3 shrink-0" />
                        ) : (
                          <AtSign className="h-3 w-3 shrink-0" />
                        )}
                        <span className="truncate">{entry.username}</span>
                      </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-0.5 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {timeAgo(entry.searchedAt)}
                    </span>
                  </div>

                  {entry.interests && entry.interests.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {entry.interests.slice(0, 3).map((interest, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-600"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}

                  {entry.summary && (
                    <p className="line-clamp-2 text-xs leading-relaxed text-gray-500">
                      {entry.summary}
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-1 text-xs font-medium text-orange-500 opacity-0 transition-opacity group-hover:opacity-100">
                    この視点で探す →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-white px-4 py-4 text-center text-xs text-gray-400">
        OtherTube — Escape your algorithm. Borrow another perspective.
      </footer>
    </div>
  );
}
