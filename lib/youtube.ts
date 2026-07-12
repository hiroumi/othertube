import type { YouTubeVideo } from "./types";

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: { medium?: { url: string }; default?: { url: string } };
    channelTitle: string;
    channelId: string;
    publishedAt: string;
  };
}

interface YouTubeApiResponse {
  items?: YouTubeSearchItem[];
  error?: { message: string };
}

const LANGUAGE_TO_REGION: Record<string, string> = {
  ja: "JP",
  en: "US",
  ko: "KR",
  zh: "TW",
  fr: "FR",
  de: "DE",
  es: "ES",
  pt: "BR",
};

export async function searchYouTubeVideos(
  queries: string[],
  options?: { language?: string }
): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY is not set");
  }

  const lang = options?.language ?? "ja";
  const regionCode = LANGUAGE_TO_REGION[lang];

  const seenIds = new Set<string>();
  const seenChannels = new Set<string>();

  const results = await Promise.all(
    queries.slice(0, 5).map(async (query) => {
      try {
        const url = new URL("https://www.googleapis.com/youtube/v3/search");
        url.searchParams.set("part", "snippet");
        url.searchParams.set("q", query);
        url.searchParams.set("type", "video");
        url.searchParams.set("maxResults", "10");
        url.searchParams.set("relevanceLanguage", lang);
        if (regionCode) url.searchParams.set("regionCode", regionCode);
        url.searchParams.set("key", apiKey);

        const res = await fetch(url.toString());
        const data: YouTubeApiResponse = await res.json();

        if (!res.ok || data.error) {
          throw new Error(`YouTube API ${res.status}: ${data.error?.message ?? JSON.stringify(data).slice(0, 100)}`);
        }

        return data.items ?? [];
      } catch (err) {
        console.error(`Failed to search YouTube for query "${query}":`, err);
        return [];
      }
    })
  );

  const allVideos: YouTubeVideo[] = [];

  for (const items of results) {
    for (const item of items) {
      const videoId = item.id.videoId;
      const channelTitle = item.snippet.channelTitle;
      if (seenIds.has(videoId)) continue;
      if (seenChannels.has(channelTitle)) continue;
      seenIds.add(videoId);
      seenChannels.add(channelTitle);

      allVideos.push({
        videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail:
          item.snippet.thumbnails.medium?.url ??
          item.snippet.thumbnails.default?.url ??
          `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${videoId}`,
      });
    }
  }

  return allVideos;
}
