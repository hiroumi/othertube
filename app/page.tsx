"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Play, PlaySquare, AtSign } from "lucide-react";
import AccountInputForm from "@/components/AccountInputForm";
import YouTubeInputForm from "@/components/YouTubeInputForm";
import SampleProfiles from "@/components/SampleProfiles";
import RecentSearches from "@/components/RecentSearches";
import FeaturedProfiles, { FEATURED_USERS } from "@/components/FeaturedProfiles";
import AgentProgress from "@/components/AgentProgress";
import Disclaimer from "@/components/Disclaimer";
import type { SourceProfile, AnalysisResult } from "@/lib/types";
import { SAMPLE_PROFILES, SAMPLE_INTEREST_PROFILES, getSampleVideosForProfile } from "@/lib/sample-data";

type Mode = "x" | "youtube";

const FEATURED_YOUTUBE_CHANNELS = [
  {
    handle: "TED",
    displayName: "TED",
    tag: "アイデア・テクノロジー・社会",
    description: "世界の第一線で活躍する思想家・研究者・起業家が18分以内で語る、世界を変えるアイデア。",
  },
  {
    handle: "veritasium",
    displayName: "Veritasium",
    tag: "物理・サイエンス・教育",
    description: "物理・数学・工学の謎を映像実験と深い考察で解き明かす科学エンターテインメントチャンネル。",
  },
  {
    handle: "mkbhd",
    displayName: "MKBHD",
    tag: "テクノロジー・ガジェット",
    description: "世界最大級のテクノロジーレビューチャンネル。最新デバイスを映像美と鋭い視点で評価。",
  },
] as const;

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("x");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [forceShowManual, setForceShowManual] = useState(false);
  const [showSamples, setShowSamples] = useState(false);

  useEffect(() => {
    FEATURED_USERS.forEach(({ username }) => {
      fetch("/api/x", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      }).catch(() => {});
    });

    // URL params からの自動トリガー（履歴ページのカードクリック）
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const source = (params.get("source") ?? "x") as Mode;
    if (q) {
      setMode(source);
      if (source === "youtube") {
        handleYouTubeChannelSubmit(q);
      } else {
        runAnalysis({ username: q, posts: [], source: "api" });
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function runAnalysis(profile: SourceProfile) {
    setIsLoading(true);
    setError("");
    setForceShowManual(false);
    setStep(0);

    try {
      setStep(1);

      if (profile.source === "api") {
        const xRes = await fetch("/api/x", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: profile.username }),
        });
        const xData = await xRes.json();

        if (xData.fallback) {
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

        profile = {
          ...profile,
          displayName: xData.profile.displayName,
          bio: xData.profile.bio,
          posts: xData.profile.posts,
          source: "api",
        };
      }

      await delay(400);

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

      setStep(3);
      await delay(400);

      setStep(4);
      const ytRes = await fetch("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queries: interestProfile.youtubeSearchQueries, language: interestProfile.language }),
      });
      const { videos: rawVideos, fallback } = await ytRes.json();

      setStep(5);
      let recommendations;

      if (fallback || !rawVideos || rawVideos.length === 0) {
        const sampleId =
          profile.source === "sample" ? profile.username : "tech_innovator";
        recommendations = getSampleVideosForProfile(sampleId);
      } else {
        const recRes = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videos: rawVideos,
            interestProfile,
            sourceChannelId: profile.sourceChannelId,
          }),
        });
        const { recommendations: rec } = await recRes.json();
        recommendations = rec;
      }

      setStep(6);
      await delay(300);

      const result: AnalysisResult = {
        sourceProfile: profile,
        interestProfile,
        videos: recommendations ?? [],
        generatedAt: new Date().toISOString(),
      };

      sessionStorage.setItem("othertube_result", JSON.stringify(result));
      router.push(`/results?t=${result.generatedAt}`);
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

  async function handleYouTubeChannelSubmit(channelInput: string) {
    setIsLoading(true);
    setError("");
    setStep(0);

    try {
      setStep(1);
      const chRes = await fetch("/api/youtube-channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelInput }),
      });
      const chData = await chRes.json();

      if (chData.fallback) {
        setIsLoading(false);
        setStep(0);
        setError("YouTube APIキーが設定されていません。");
        return;
      }
      if (!chRes.ok || chData.error) {
        throw new Error(chData.error ?? "チャンネルの取得に失敗しました。");
      }

      const { channelInfo } = chData;

      const posts = channelInfo.recentVideos.map(
        (v: { title: string; description: string }) =>
          `動画タイトル: ${v.title}\n概要: ${v.description}`
      );

      const profile: SourceProfile = {
        username: channelInfo.handle?.replace(/^@/, "") ?? channelInfo.channelId,
        displayName: channelInfo.channelTitle,
        bio: channelInfo.description,
        posts,
        source: "youtube",
        sourceChannelId: channelInfo.channelId,
      };

      await runAnalysis(profile);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "チャンネルの取得に失敗しました。"
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
    router.push(`/results?t=${result.generatedAt}`);
  }

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  return (
    <div className="flex min-h-screen flex-col">
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
                  誰かの視点を借りて、普段と違うYouTubeを探索しよう。
                </p>

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

                <div className="mx-auto max-w-lg space-y-6">
                  {/* Mode tabs */}
                  <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1">
                    <button
                      onClick={() => { setMode("x"); setError(""); }}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                        mode === "x"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <AtSign className="h-4 w-4" />
                      Xアカウント
                    </button>
                    <button
                      onClick={() => { setMode("youtube"); setError(""); }}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                        mode === "youtube"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <PlaySquare className="h-4 w-4" />
                      YouTubeチャンネル
                    </button>
                  </div>

                  {mode === "x" ? (
                    <>
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
                          <span className="bg-white px-3 text-xs text-gray-400">またはXのおすすめユーザー</span>
                        </div>
                      </div>

                      <FeaturedProfiles onSelect={runAnalysis} isLoading={isLoading} />
                    </>
                  ) : (
                    <>
                      <YouTubeInputForm
                        onSubmit={handleYouTubeChannelSubmit}
                        isLoading={isLoading}
                        externalError={error}
                      />

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-white px-3 text-xs text-gray-400">またはおすすめチャンネル</span>
                        </div>
                      </div>

                      {/* Featured YouTube Channels */}
                      <div className="space-y-3">
                        <p className="text-center text-sm font-medium text-gray-500">
                          おすすめチャンネルで試す
                        </p>
                        <div className="grid gap-3 sm:grid-cols-3">
                          {FEATURED_YOUTUBE_CHANNELS.map((ch) => (
                            <button
                              key={ch.handle}
                              onClick={() => handleYouTubeChannelSubmit(`@${ch.handle}`)}
                              disabled={isLoading}
                              className="group rounded-xl border border-gray-200 bg-white p-4 text-left transition-all duration-200 hover:border-red-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <div className="mb-2">
                                <p className="text-sm font-bold text-gray-800">{ch.displayName}</p>
                                <p className="flex items-center gap-0.5 text-xs text-red-500">
                                  <PlaySquare className="h-3 w-3" />
                                  @{ch.handle}
                                </p>
                              </div>
                              <p className="mb-2 text-xs font-medium text-red-600 bg-red-50 rounded-full px-2 py-0.5 inline-block">
                                {ch.tag}
                              </p>
                              <p className="text-xs leading-relaxed text-gray-500">{ch.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-3 text-xs text-gray-400">または他のユーザーの視点で試す</span>
                    </div>
                  </div>

                  <RecentSearches
                    onSelectX={(username) =>
                      runAnalysis({ username, posts: [], source: "api" })
                    }
                    onSelectYouTube={handleYouTubeChannelSubmit}
                    isLoading={isLoading}
                    onEmpty={() => setShowSamples(true)}
                  />

                  {showSamples && (
                    <>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-white px-3 text-xs text-gray-400">またはサンプルで試す</span>
                        </div>
                      </div>
                      <SampleProfiles profiles={SAMPLE_PROFILES} onSelect={handleSampleSelect} />
                    </>
                  )}

                  <Disclaimer />
                </div>
              </div>
            </section>

            <section className="border-t border-gray-100 bg-gray-50 px-4 py-12">
              <div className="mx-auto max-w-3xl">
                <h2 className="mb-8 text-center text-lg font-bold text-gray-700">
                  仕組み
                </h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      step: "01",
                      title: "アカウントを入力",
                      desc: "XアカウントまたはYouTubeチャンネルのURLや@ハンドルを入力します。",
                    },
                    {
                      step: "02",
                      title: "AIが関心を推定",
                      desc: "公開された投稿・動画からAIが関心・視点・キーワードを分析します。",
                    },
                    {
                      step: "03",
                      title: "仮想フィードを生成",
                      desc: "その人物・クリエイターの関心に基づいたYouTube動画を3つの視点で提示します。",
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
