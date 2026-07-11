"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Play, ArrowLeft, Star, Compass, Shuffle } from "lucide-react";
import VideoCard from "@/components/VideoCard";
import type { AnalysisResult, RecommendedVideo, RecommendationCategory } from "@/lib/types";

const SECTION_CONFIG: Record<
  RecommendationCategory,
  { title: string; subtitle: string; Icon: React.ElementType; headerClass: string }
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

function MoreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCategory = searchParams.get("category");
  const category = (rawCategory ?? "core") as RecommendationCategory;

  const [result] = useState<AnalysisResult | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = sessionStorage.getItem("othertube_result");
    return stored ? (JSON.parse(stored) as AnalysisResult) : null;
  });

  useEffect(() => {
    if (!result) {
      router.replace("/");
    }
  }, [result, router]);

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  const config = SECTION_CONFIG[category] ?? SECTION_CONFIG.core;
  const { title, subtitle, Icon, headerClass } = config;

  const categoryVideos: RecommendedVideo[] = result.videos.filter(
    (v) => v.category === category
  );

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </button>
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5 fill-red-500 text-red-500" />
            <span className="text-lg font-bold text-gray-900">
              Other<span className="text-red-500">Tube</span>
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Section header */}
          <div className="mb-6 flex items-center gap-3">
            <Icon className={`h-6 w-6 ${headerClass}`} />
            <div>
              <h1 className={`text-2xl font-black ${headerClass}`}>{title}</h1>
              <p className="text-sm text-gray-500">
                {result.interestProfile.displayName} の視点 · {subtitle}
              </p>
            </div>
          </div>

          {categoryVideos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-400">このカテゴリの動画はありません。</p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-gray-500">{categoryVideos.length}件の動画</p>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                {categoryVideos.map((video) => (
                  <VideoCard key={video.videoId} video={video} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-white px-4 py-4 text-center text-xs text-gray-400">
        OtherTube — この人物の関心からAIが選んだ仮想YouTubeフィードです。実際の視聴履歴ではありません。
      </footer>
    </div>
  );
}

export default function MorePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
        </div>
      }
    >
      <MoreContent />
    </Suspense>
  );
}
