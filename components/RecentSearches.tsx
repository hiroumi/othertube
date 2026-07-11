"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AtSign, PlaySquare, Clock, ChevronRight } from "lucide-react";
import type { SearchHistoryEntry } from "@/lib/cache";

interface RecentSearchesProps {
  onSelectX: (username: string) => void;
  onSelectYouTube: (handle: string) => void;
  isLoading: boolean;
  onEmpty?: () => void;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return "たった今";
  if (m < 60) return `${m}分前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}時間前`;
  return `${Math.floor(h / 24)}日前`;
}

export default function RecentSearches({
  onSelectX,
  onSelectYouTube,
  isLoading,
  onEmpty,
}: RecentSearchesProps) {
  const [entries, setEntries] = useState<SearchHistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/history?limit=3")
      .then((r) => r.json())
      .then((data) => {
        const list: SearchHistoryEntry[] = data.entries ?? [];
        setEntries(list);
        setLoaded(true);
        if (list.length === 0) onEmpty?.();
      })
      .catch(() => {
        setLoaded(true);
        onEmpty?.();
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!loaded || entries.length === 0) return null;

  function handleClick(entry: SearchHistoryEntry) {
    if (entry.source === "youtube") {
      onSelectYouTube(`@${entry.username}`);
    } else {
      onSelectX(entry.username);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">最近検索されたアカウント</p>
        <Link
          href="/history"
          className="flex items-center gap-0.5 text-xs text-red-500 hover:text-red-600 transition-colors"
        >
          もっと見る
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {entries.map((entry) => (
          <button
            key={`${entry.source}:${entry.username}`}
            onClick={() => handleClick(entry)}
            disabled={isLoading}
            className="group rounded-xl border border-gray-200 bg-white p-4 text-left transition-all duration-200 hover:border-orange-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-800">
                  {entry.displayName ?? entry.username}
                </p>
                <p
                  className={`flex items-center gap-0.5 text-xs truncate ${
                    entry.source === "youtube" ? "text-red-500" : "text-sky-500"
                  }`}
                >
                  {entry.source === "youtube" ? (
                    <PlaySquare className="h-3 w-3 shrink-0" />
                  ) : (
                    <AtSign className="h-3 w-3 shrink-0" />
                  )}
                  {entry.username}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-0.5 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                {timeAgo(entry.searchedAt)}
              </span>
            </div>

            {entry.interests && entry.interests.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {entry.interests.slice(0, 2).map((interest, i) => (
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
          </button>
        ))}
      </div>
    </div>
  );
}
