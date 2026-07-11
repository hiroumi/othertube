import Link from "next/link";
import { Star, Compass, Shuffle, ChevronRight } from "lucide-react";
import VideoCard from "./VideoCard";
import type { RecommendedVideo, RecommendationCategory } from "@/lib/types";

const SECTION_CONFIG: Record<
  RecommendationCategory,
  {
    title: string;
    subtitle: string;
    Icon: React.ElementType;
    headerClass: string;
    moreClass: string;
  }
> = {
  core: {
    title: "Core Interests",
    subtitle: "この人物が明確に関心を示しているテーマの動画",
    Icon: Star,
    headerClass: "text-red-600",
    moreClass: "text-red-500 hover:text-red-700",
  },
  adjacent: {
    title: "Adjacent Interests",
    subtitle: "関心分野から一歩広げた周辺領域の動画",
    Icon: Compass,
    headerClass: "text-orange-600",
    moreClass: "text-orange-500 hover:text-orange-700",
  },
  opposite: {
    title: "Opposite Lens",
    subtitle: "異なる立場・反対意見・別の価値観を含む動画",
    Icon: Shuffle,
    headerClass: "text-purple-600",
    moreClass: "text-purple-500 hover:text-purple-700",
  },
};

interface VideoSectionProps {
  category: RecommendationCategory;
  videos: RecommendedVideo[];
}

export default function VideoSection({ category, videos }: VideoSectionProps) {
  const { title, subtitle, Icon, headerClass, moreClass } = SECTION_CONFIG[category];

  if (videos.length === 0) return null;

  const displayed = videos.slice(0, 5);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${headerClass}`} />
          <div>
            <h2 className={`text-lg font-bold ${headerClass}`}>{title}</h2>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
        <Link
          href={`/results/more?category=${category}`}
          className={`flex shrink-0 items-center gap-1 text-sm font-medium transition-colors ${moreClass}`}
        >
          もっと見る
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {displayed.map((video) => (
          <VideoCard key={video.videoId} video={video} />
        ))}
      </div>
    </section>
  );
}
