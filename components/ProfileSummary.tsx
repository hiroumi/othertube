import { Tag, Eye, Search } from "lucide-react";
import type { InterestProfile, SourceProfile } from "@/lib/types";

interface ProfileSummaryProps {
  sourceProfile: SourceProfile;
  interestProfile: InterestProfile;
}

export default function ProfileSummary({ sourceProfile, interestProfile }: ProfileSummaryProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-pink-500 text-xl font-bold text-white shadow-sm">
          {(interestProfile.displayName || sourceProfile.username).charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {interestProfile.displayName || sourceProfile.displayName || sourceProfile.username}
          </h2>
          <p className="text-sm text-gray-500">@{sourceProfile.username}</p>
          <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {sourceProfile.source === "sample"
              ? "デモサンプル"
              : sourceProfile.source === "manual"
              ? "手動入力"
              : "X API"}
          </span>
        </div>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-gray-700">{interestProfile.summary}</p>

      <div className="mb-4">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
          <Tag className="h-3.5 w-3.5" />
          関心分野
        </div>
        <div className="flex flex-wrap gap-2">
          {interestProfile.interests.map((interest) => (
            <span
              key={interest}
              className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-4 rounded-xl bg-gray-50 p-3">
        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
          <Eye className="h-3.5 w-3.5" />
          視点の特徴
        </div>
        <p className="text-sm text-gray-700">{interestProfile.perspective}</p>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
          <Search className="h-3.5 w-3.5" />
          使用した検索キーワード
        </div>
        <div className="flex flex-wrap gap-1.5">
          {interestProfile.keywords.map((kw) => (
            <span key={kw} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {kw}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
