"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Play } from "lucide-react";
import AccountInputForm from "@/components/AccountInputForm";
import SampleProfiles from "@/components/SampleProfiles";
import FeaturedProfiles, { FEATURED_USERS } from "@/components/FeaturedProfiles";
import AgentProgress from "@/components/AgentProgress";
import Disclaimer from "@/components/Disclaimer";
import type { SourceProfile, AnalysisResult } from "@/lib/types";
import { SAMPLE_PROFILES, SAMPLE_INTEREST_PROFILES, getSampleVideosForProfile } from "@/lib/sample-data";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [forceShowManual, setForceShowManual] = useState(false);

  // ページロード時におすすめユーザーのX APIをバックグラウンドでキャッシュウォーム
  useEffect(() => {
    FEATURED_USERS.forEach(({ username }) => {
      fetch("/api/x", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      }).catch(() => {});
    });
  }, []);

  async function runAnalysis(profile: SourceProfile) {
    setIsLoading(true);
    setError("");
    setForceShowManual(false);
    setStep(0);

    try {
      // Step 1: プロフィール読み取り（X APIで自動取得 or 手動投稿をそのまま使用）
      setStep(1);

      if (profile.source === "api") {
        const xRes = await fetch("/api/x", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: profile.username }),
        });
        const xData = await xRes.json();

        if (xData.fallback) {
          // X APIが使えない → 手動入力フォームを展開して停止
          setIsLoading(false);
          setStep(0);
          setForceShowManual(true);
          setError(
            xData.reason === "no_token"
              ? "X APIキーが設定されていません。投稿テキストを手動で貼り付けてください。"
              : `X APIエラー：${xData.message ?? "取得できませんでした。"}投稿テキストを手動で貼り付けてください。`
          );
          return;
        }

        // X APIで取得成功 → profileを更新
        profile = {
          ...profile,
          displayName: xData.profile.displayName,
          bio: xData.profile.bio,
          posts: xData.profile.posts,
          source: "api",
        };
      }

      await delay(400);

      // Step 2: 関心テーマ抽出
      setStep(2);
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });

      if (!analyzeRes.ok) {
        const errBody = await analyzeRes.json().catch(() => ({}));
        throw new Error(
          (errBody as { error?: string }).error ?? "プロフィール分析に失敗しました。"
        );
      }
      const analyzeData = await analyzeRes.json();
      if (analyzeData.anthropicError) {
        console.warn("Anthropic fallback:", analyzeData.anthropicError);
      }
      const { interestProfile } = analyzeData;

      // Step 3: YouTube検索プラン
      setStep(3);
      await delay(400);

      // Step 4: 動画候補探索
      setStep(4);
      const ytRes = await fetch("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queries: interestProfile.youtubeSearchQueries }),
      });
      const { videos: rawVideos, fallback } = await ytRes.json();

      // Step 5: スコアリング
      setStep(5);
      let recommendations;

      if (fallback || !rawVideos || rawVideos.length === 0) {
        // YouTube APIなし：サンプル動画を使用
        const sampleId =
          profile.source === "sample" ? profile.username : "tech_innovator";
        recommendations = getSampleVideosForProfile(sampleId);
      } else {
        const recRes = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videos: rawVideos, interestProfile }),
        });
        const { recommendations: rec } = await recRes.json();
        recommendations = rec;
      }

      // Step 6: フィード生成
      setStep(6);
      await delay(300);

      const result: AnalysisResult = {
        sourceProfile: profile,
        interestProfile,
        videos: recommendations ?? [],
        generatedAt: new Date().toISOString(),
      };

      // 結果をsessionStorageに保存してリダイレクト
      sessionStorage.setItem("othertube_result", JSON.stringify(result));
      router.push("/results");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "分析中にエラーが発生しました。サンプルデータでお試しください。"
      );
      setIsLoading(false);
      setStep(0);
    }
  }

  async function handleSampleSelect(sample: (typeof SAMPLE_PROFILES)[0]) {
    const profile: SourceProfile = {
      username: sample.id,
      displayName: sample.displayName,
      bio: sample.bio,
      posts: sample.posts,
      source: "sample",
    };

    // サンプルは事前定義データを直接使用（高速）
    setIsLoading(true);
    setError("");

    for (let s = 1; s <= 6; s++) {
      setStep(s);
      await delay(s === 4 ? 700 : 400);
    }

    const interestProfile = SAMPLE_INTEREST_PROFILES[sample.id];
    const videos = getSampleVideosForProfile(sample.id);

    const result: AnalysisResult = {
      sourceProfile: profile,
      interestProfile,
      videos,
      generatedAt: new Date().toISOString(),
    };

    sessionStorage.setItem("othertube_result", JSON.stringify(result));
    router.push("/results");
  }

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center gap-2">
          <Play className="h-5 w-5 fill-red-500 text-red-500" />
          <span className="text-lg font-bold text-gray-900">
            Other<span className="text-red-500">Tube</span>
          </span>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center px-4 py-16">
            <AgentProgress currentStep={step} />
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <section className="bg-white px-4 pb-12 pt-16">
              <div className="mx-auto max-w-2xl text-center">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  フィルターバブルを超える
                </div>

                <h1 className="mb-4 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
                  Other<span className="text-red-500">Tube</span>
                </h1>

                <p className="mb-2 text-lg font-medium text-gray-600 sm:text-xl">
                  Escape your algorithm. Borrow another perspective.
                </p>

                <p className="mb-8 text-sm text-gray-500">
                  いつものおすすめから抜け出して、誰かの視点でYouTubeを探索しよう。
                </p>

                {/* Visual */}
                <div className="mx-auto mb-10 flex max-w-sm items-center justify-center gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100 text-2xl">
                      🫵
                    </div>
                    <span className="text-xs text-gray-500">あなたの<br />アルゴリズム</span>
                  </div>
                  <div className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex w-full items-center">
                      <div className="h-px flex-1 bg-gradient-to-r from-gray-300 to-red-400" />
                      <ArrowRight className="h-4 w-4 text-red-500" />
                    </div>
                    <span className="text-xs text-red-400 font-medium">視点を借りる</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-200 bg-red-50 text-2xl">
                      👤
                    </div>
                    <span className="text-xs text-gray-500">他の人の<br />視点</span>
                  </div>
                  <div className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex w-full items-center">
                      <div className="h-px flex-1 bg-gradient-to-r from-red-400 to-red-500" />
                      <ArrowRight className="h-4 w-4 text-red-600" />
                    </div>
                    <span className="text-xs text-red-500 font-medium">発見</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-300 bg-gradient-to-br from-red-400 to-pink-400 text-2xl">
                      ✨
                    </div>
                    <span className="text-xs text-gray-500">セレン<br />ディピティ</span>
                  </div>
                </div>

                {/* Input Form */}
                <div className="mx-auto max-w-lg space-y-6">
                  <AccountInputForm
                    onSubmit={runAnalysis}
                    isLoading={isLoading}
                    forceShowManual={forceShowManual}
                    externalError={error}
                  />

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-3 text-xs text-gray-400">または</span>
                    </div>
                  </div>

                  <FeaturedProfiles onSelect={runAnalysis} isLoading={isLoading} />

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-3 text-xs text-gray-400">またはサンプルで試す</span>
                    </div>
                  </div>

                  <SampleProfiles profiles={SAMPLE_PROFILES} onSelect={handleSampleSelect} />

                  <Disclaimer />
                </div>
              </div>
            </section>

            {/* How it works */}
            <section className="border-t border-gray-100 bg-gray-50 px-4 py-12">
              <div className="mx-auto max-w-3xl">
                <h2 className="mb-8 text-center text-lg font-bold text-gray-700">
                  仕組み
                </h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      step: "01",
                      title: "Xアカウントを入力",
                      desc: "分析したい人物のXアカウントURLや投稿テキストを入力します。",
                    },
                    {
                      step: "02",
                      title: "AIが関心を推定",
                      desc: "公開情報からAIが関心・視点・キーワードを分析します。",
                    },
                    {
                      step: "03",
                      title: "仮想フィードを生成",
                      desc: "その人物の関心に基づいたYouTube動画を3つの視点で提示します。",
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                    >
                      <span className="mb-3 block text-3xl font-black text-red-100">
                        {item.step}
                      </span>
                      <h3 className="mb-1.5 text-sm font-bold text-gray-800">{item.title}</h3>
                      <p className="text-xs leading-relaxed text-gray-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="border-t border-gray-100 bg-white px-4 py-4 text-center text-xs text-gray-400">
        OtherTube — Escape your algorithm. Borrow another perspective.
      </footer>
    </div>
  );
}
