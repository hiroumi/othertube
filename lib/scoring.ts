import type { YouTubeVideo, RecommendedVideo, InterestProfile } from "./types";

function computeSimpleScore(video: YouTubeVideo, profile: InterestProfile): number {
  const text = `${video.title} ${video.description} ${video.channelTitle}`.toLowerCase();
  let score = 0;

  for (const kw of profile.keywords) {
    if (text.includes(kw.toLowerCase())) score += 15;
  }
  for (const interest of profile.interests) {
    if (text.includes(interest.toLowerCase())) score += 10;
  }

  return Math.min(score, 100);
}

export function scoreAndCategorizeVideos(
  videos: YouTubeVideo[],
  profile: InterestProfile
): RecommendedVideo[] {
  const scored = videos.map((video) => {
    const rel = computeSimpleScore(video, profile);
    const ser = Math.max(0, 80 - rel + Math.floor(Math.random() * 20));

    const category =
      rel >= 60
        ? ("core" as const)
        : rel >= 30
        ? ("adjacent" as const)
        : ("opposite" as const);

    const reason =
      category === "core"
        ? `${profile.interests[0] ?? "関心テーマ"}に関連する内容として推薦されました。`
        : category === "adjacent"
        ? `${profile.interests[0] ?? "関心テーマ"}から一歩広がった周辺領域の視点を提供します。`
        : `普段の関心とは異なる立場からの視点を提供し、多様な考え方との出会いを生み出します。`;

    return { ...video, category, reason, relevanceScore: rel, serendipityScore: ser };
  });

  const core = scored.filter((v) => v.category === "core").slice(0, 10);
  const adjacent = scored.filter((v) => v.category === "adjacent").slice(0, 10);
  const opposite = scored.filter((v) => v.category === "opposite").slice(0, 10);

  return [...core, ...adjacent, ...opposite];
}
