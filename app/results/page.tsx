"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, ArrowLeft, RefreshCw, Share2, Check } from "lucide-react";
import ProfileSummary from "@/components/ProfileSummary";
import VideoSection from "@/components/VideoSection";
import Disclaimer from "@/components/Disclaimer";
import type { AnalysisResult, RecommendedVideo, RecommendationCategory } from "@/lib/types";

function loadResult(): AnalysisResult | null {
  if (typeof window === "undefined") return null;
  const stored = sessionStorage.getItem("othertube_result");
  return stored ? (JSON.parse(stored) as AnalysisResult) : null;
}

export default function ResultsPage() {
  const router = useRouter();
  const [result] = useState<AnalysisResult | null>(loadResult);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!result) {
      router.replace("/");
    }
  }, [result, router]);

  function getVideosByCategory(category: RecommendationCategory): RecommendedVideo[] {
    return (result?.videos ?? []).filter((v) => v.category === category);
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }

  async function handleRegenerate() {
    if (!result) return;
    // 同じプロフィールで再分析
    sessionStorage.setItem("othertube_regenerate", JSON.stringify(result.sourceProfile));
    router.push("/");
  }

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  const coreVideos = getVideosByCategory("core");
  const adjacentVideos = getVideosByCategory("adjacent");
  const oppositeVideos = getVideosByCategory("opposite");

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
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

          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              再生成
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  コピー完了
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  共有
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Page title */}
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-red-500">
              仮想YouTubeフィード
            </p>
            <h1 className="text-2xl font-black text-gray-900">
              {result.interestProfile.displayName} の視点
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              公開情報から推定したおすすめ動画 · {result.videos.length}件
            </p>
          </div>

          {/* Disclaimer */}
          <Disclaimer />

          {/* Profile Summary */}
          <ProfileSummary
            sourceProfile={result.sourceProfile}
            interestProfile={result.interestProfile}
          />

          {/* Video Sections */}
          {coreVideos.length > 0 && (
            <VideoSection category="core" videos={coreVideos} />
          )}
          {adjacentVideos.length > 0 && (
            <VideoSection category="adjacent" videos={adjacentVideos} />
          )}
          {oppositeVideos.length > 0 && (
            <VideoSection category="opposite" videos={oppositeVideos} />
          )}

          {result.videos.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-400">動画が見つかりませんでした。</p>
              <button
                onClick={() => router.push("/")}
                className="mt-4 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
              >
                別の人物を試す
              </button>
            </div>
          )}

          {/* Bottom actions */}
          <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-6">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              別の人物を試す
            </button>
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              検索結果を再生成する
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors"
            >
              {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              {copied ? "URLをコピーしました" : "この結果を共有する"}
            </button>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-white px-4 py-4 text-center text-xs text-gray-400">
        OtherTube — この人物の関心からAIが選んだ仮想YouTubeフィードです。実際の視聴履歴ではありません。
      </footer>
    </div>
  );
}
