import Image from "next/image";
import { ExternalLink, Calendar } from "lucide-react";
import type { RecommendedVideo, RecommendationCategory } from "@/lib/types";

const CATEGORY_CONFIG: Record<
  RecommendationCategory,
  { label: string; badgeClass: string }
> = {
  core: { label: "Core Interests", badgeClass: "bg-red-100 text-red-700" },
  adjacent: { label: "Adjacent Interests", badgeClass: "bg-orange-100 text-orange-700" },
  opposite: { label: "Opposite Lens", badgeClass: "bg-purple-100 text-purple-700" },
};

interface VideoCardProps {
  video: RecommendedVideo;
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function VideoCard({ video }: VideoCardProps) {
  const config = CATEGORY_CONFIG[video.category];
  const publishedDate = new Date(video.publishedAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
  });

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="relative h-44 overflow-hidden bg-gray-100">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <span
          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold ${config.badgeClass}`}
        >
          {config.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 gap-3">
        <div>
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 leading-snug">
            {video.title}
          </h3>
          <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500">
            <span className="font-medium text-gray-600">{video.channelTitle}</span>
            <span>·</span>
            <Calendar className="h-3 w-3" />
            <span>{publishedDate}</span>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-gray-600 line-clamp-3 border-l-2 border-red-200 pl-3">
          {video.reason}
        </p>

        <div className="space-y-2">
          <ScoreBar label="関連度" value={video.relevanceScore} color="bg-red-400" />
          <ScoreBar label="意外性" value={video.serendipityScore} color="bg-purple-400" />
        </div>

        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto flex items-center justify-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          YouTubeで見る
        </a>
      </div>
    </div>
  );
}
