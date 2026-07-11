export interface YouTubeChannelInfo {
  channelId: string;
  channelTitle: string;
  description: string;
  handle?: string;
  thumbnailUrl?: string;
  recentVideos: Array<{ title: string; description: string }>;
}

interface ChannelApiResponse {
  items?: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      customUrl?: string;
      thumbnails?: { default?: { url: string } };
    };
    contentDetails: {
      relatedPlaylists: { uploads: string };
    };
  }>;
  error?: { message: string };
}

interface PlaylistApiResponse {
  items?: Array<{
    snippet: {
      title: string;
      description: string;
    };
  }>;
}

export function normalizeChannelInput(input: string): string {
  return input.trim();
}

function buildChannelParams(input: string): Record<string, string> {
  const trimmed = input.trim();

  const handleUrlMatch = trimmed.match(/youtube\.com\/@([A-Za-z0-9_\-.]+)/);
  if (handleUrlMatch) return { forHandle: `@${handleUrlMatch[1]}` };

  const channelIdUrlMatch = trimmed.match(/youtube\.com\/channel\/(UC[A-Za-z0-9_\-]+)/);
  if (channelIdUrlMatch) return { id: channelIdUrlMatch[1] };

  const atHandleMatch = trimmed.match(/^@([A-Za-z0-9_\-.]+)$/);
  if (atHandleMatch) return { forHandle: `@${atHandleMatch[1]}` };

  if (/^UC[A-Za-z0-9_\-]{20,}$/.test(trimmed)) return { id: trimmed };

  // Default: assume handle without @
  return { forHandle: `@${trimmed}` };
}

export async function fetchYouTubeChannelInfo(input: string): Promise<YouTubeChannelInfo> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error("YOUTUBE_API_KEY is not set");

  const params = buildChannelParams(input);

  const channelsUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
  channelsUrl.searchParams.set("part", "snippet,contentDetails");
  for (const [k, v] of Object.entries(params)) channelsUrl.searchParams.set(k, v);
  channelsUrl.searchParams.set("key", apiKey);

  const channelRes = await fetch(channelsUrl.toString());
  const channelData: ChannelApiResponse = await channelRes.json();

  if (!channelRes.ok) {
    throw new Error(channelData.error?.message ?? `YouTube APIエラー: ${channelRes.status}`);
  }

  if (!channelData.items || channelData.items.length === 0) {
    throw new Error("チャンネルが見つかりませんでした。URLまたは@ハンドルを確認してください。");
  }

  const channel = channelData.items[0];
  const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;

  const playlistUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
  playlistUrl.searchParams.set("part", "snippet");
  playlistUrl.searchParams.set("playlistId", uploadsPlaylistId);
  playlistUrl.searchParams.set("maxResults", "20");
  playlistUrl.searchParams.set("key", apiKey);

  const playlistRes = await fetch(playlistUrl.toString());
  const playlistData: PlaylistApiResponse = playlistRes.ok ? await playlistRes.json() : {};

  const recentVideos = (playlistData.items ?? []).map((item) => ({
    title: item.snippet.title,
    description: item.snippet.description.slice(0, 200),
  }));

  return {
    channelId: channel.id,
    channelTitle: channel.snippet.title,
    description: channel.snippet.description.slice(0, 500),
    handle: channel.snippet.customUrl,
    thumbnailUrl: channel.snippet.thumbnails?.default?.url,
    recentVideos,
  };
}
