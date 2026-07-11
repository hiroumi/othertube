"use client";

import { AtSign } from "lucide-react";
import type { SourceProfile } from "@/lib/types";

export const FEATURED_USERS = [
  {
    username: "10000nabe",
    displayName: "渡辺銀次",
    tag: "お笑い・地方・食文化",
    description: "お笑いコンビ「ドンデコルテ」。吉本所属。地産地消・ご当地グルメを愛するコメディアン。",
  },
  {
    username: "ochyai",
    displayName: "落合陽一",
    tag: "テクノロジー・アート・研究",
    description: "メディアアーティスト・筑波大学准教授。デジタルネイチャーの思想でテクノロジーとアートの境界を探求。",
  },
  {
    username: "shi3z",
    displayName: "清水亮",
    tag: "AI・エンジニア・起業家",
    description: "AI研究者・起業家。日本のAI・ソフトウェア開発シーンを長年牽引するエンジニア。",
  },
] as const;

interface FeaturedProfilesProps {
  onSelect: (profile: SourceProfile) => void;
  isLoading: boolean;
}

export default function FeaturedProfiles({ onSelect, isLoading }: FeaturedProfilesProps) {
  function handleClick(user: (typeof FEATURED_USERS)[number]) {
    onSelect({
      username: user.username,
      displayName: user.displayName,
      posts: [],
      source: "api",
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-center text-sm font-medium text-gray-500">
        おすすめユーザーで試す
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {FEATURED_USERS.map((user) => (
          <button
            key={user.username}
            onClick={() => handleClick(user)}
            disabled={isLoading}
            className="group rounded-xl border border-gray-200 bg-white p-4 text-left transition-all duration-200 hover:border-sky-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-gray-800">{user.displayName}</p>
                <p className="flex items-center gap-0.5 text-xs text-sky-500">
                  <AtSign className="h-3 w-3" />
                  {user.username}
                </p>
              </div>
            </div>
            <p className="mb-2 text-xs font-medium text-sky-600 bg-sky-50 rounded-full px-2 py-0.5 inline-block">
              {user.tag}
            </p>
            <p className="text-xs leading-relaxed text-gray-500">{user.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
