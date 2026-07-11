import { Star, Compass, Shuffle } from "lucide-react";
import VideoCard from "./VideoCard";
import type { RecommendedVideo, RecommendationCategory } from "@/lib/types";

const SECTION_CONFIG: Record<
  RecommendationCategory,
  {
    title: string;
    subtitle: string;
    Icon: React.ElementType;
    headerClass: string;
  }
> = {
  core: {
    title: "Core Interests",
    subtitle: "この人物が明確に関心を示しているテーマの動画",
    Icon: Star,
    headerClass: "text-red-600",
  },
  adjacent: {
    title: "Adjacent Interests",
    subtitle: "関心分野から一歩広げた周辺領域の動画",
    Icon: Compass,
    headerClass: "text-orange-600",
  },
  opposite: {
    title: "Opposite Lens",
    subtitle: "異なる立場・反対意見・別の価値観を含む動画",
    Icon: Shuffle,
    headerClass: "text-purple-600",
  },
};

interface VideoSectionProps {
  category: RecommendationCategory;
  videos: RecommendedVideo[];
}

export default function VideoSection({ category, videos }: VideoSectionProps) {
  const { title, subtitle, Icon, headerClass } = SECTION_CONFIG[category];

  if (videos.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <Icon className={`h-5 w-5 ${headerClass}`} />
        <div>
          <h2 className={`text-lg font-bold ${headerClass}`}>{title}</h2>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <VideoCard key={video.videoId} video={video} />
        ))}
      </div>
    </section>
  );
}
