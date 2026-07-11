import Anthropic from "@anthropic-ai/sdk";
import type { SourceProfile, InterestProfile } from "./types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeProfile(profile: SourceProfile): Promise<InterestProfile> {
  const effectivePosts = profile.posts.length > 0
    ? profile.posts
    : profile.bio
    ? [profile.bio]
    : [];

  const postsText = effectivePosts.length > 0
    ? effectivePosts.map((p, i) => `${i + 1}. ${p}`).join("\n")
    : "(情報なし — プロフィール情報のみで推定)";

  const isYouTube = profile.source === "youtube";

  const prompt = isYouTube
    ? `You are analyzing a YouTube creator's channel to understand the themes, interests, and perspective expressed through their content.

Channel:
- Handle: @${profile.username}
- Channel Name: ${profile.displayName ?? profile.username}
- Description: ${profile.bio ?? "No description available"}

Recent Video Titles and Descriptions:
${postsText}

Based on this creator's content, generate an interest profile. The goal is to discover what OTHER YouTube videos (from different channels) this creator's audience would enjoy — not similar creators, but intellectually adjacent or contrasting content.

Return ONLY valid JSON with no additional text.

{
  "displayName": "string - channel name",
  "summary": "string - 1-2 sentences in Japanese describing this creator's themes and perspective",
  "interests": ["array of 4-6 interest topics in Japanese that characterize this channel"],
  "perspective": "string - 1-2 sentences in Japanese describing this creator's worldview or approach",
  "keywords": ["array of 4-6 English keywords characterizing this channel's content"],
  "language": "ISO 639-1 code of the creator's primary language detected from their video titles/descriptions (e.g. 'ja' for Japanese, 'en' for English)",
  "youtubeSearchQueries": ["array of 4-5 search queries to find interesting content FROM OTHER CHANNELS. Write queries in the SAME language as the creator's primary language (detected above). For technical/international topics, mixing English terms is fine."]
}`
    : `You are analyzing a person's public X (Twitter) profile and posts to understand their interests and perspective.

Profile:
- Username: @${profile.username}
- Display Name: ${profile.displayName ?? profile.username}
- Bio: ${profile.bio ?? "No bio available"}

Recent Posts:
${postsText}

Based on this public information, generate an interest profile as a JSON object. Return ONLY valid JSON with no additional text.

{
  "displayName": "string - their display name or username",
  "summary": "string - 1-2 sentences in Japanese describing their interests and perspective",
  "interests": ["array of 4-6 interest topics in Japanese"],
  "perspective": "string - 1-2 sentences in Japanese describing how they view the world",
  "keywords": ["array of 4-6 keywords for YouTube search"],
  "language": "ISO 639-1 code of the user's primary language detected from their posts (e.g. 'ja' for Japanese, 'en' for English)",
  "youtubeSearchQueries": ["array of 4-5 YouTube search queries. Write them in the SAME language as the user's posts (detected above). For technical/international terms, mixing English is fine."]
}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude API");
  }

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in Claude API response");
  }

  return JSON.parse(jsonMatch[0]) as InterestProfile;
}

export async function categorizeAndScoreVideos(
  interestProfile: InterestProfile,
  videos: import("./types").YouTubeVideo[]
): Promise<import("./types").RecommendedVideo[]> {
  if (videos.length === 0) return [];

  const videoList = videos
    .map(
      (v, i) =>
        `${i + 1}. Title: "${v.title}" | Channel: ${v.channelTitle} | Description: ${v.description.slice(0, 100)}`
    )
    .join("\n");

  const prompt = `You are recommending YouTube videos for someone with this interest profile:
- Summary: ${interestProfile.summary}
- Interests: ${interestProfile.interests.join(", ")}
- Perspective: ${interestProfile.perspective}

Available videos:
${videoList}

For each video, assign:
- category: "core" (directly matches interests), "adjacent" (related but broader), or "opposite" (different perspective/viewpoint)
- reason: 1-2 sentences in Japanese explaining why this video is recommended
- relevanceScore: 0-100 integer (relevance to person's interests)
- serendipityScore: 0-100 integer (how surprising/unexpected for this person)

Select the BEST videos for each category: up to 10 core, 10 adjacent, 10 opposite (total up to 30).
If fewer than 10 qualify for a category, include as many as meet the criteria.
Return ONLY valid JSON array:
[
  {
    "videoIndex": number (1-based index from the list above),
    "category": "core"|"adjacent"|"opposite",
    "reason": "Japanese string",
    "relevanceScore": number,
    "serendipityScore": number
  }
]`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude API");
  }

  const jsonMatch = content.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("No JSON array found in Claude API response");
  }

  type ScoreEntry = {
    videoIndex: number;
    category: import("./types").RecommendationCategory;
    reason: string;
    relevanceScore: number;
    serendipityScore: number;
  };

  const scored = JSON.parse(jsonMatch[0]) as ScoreEntry[];

  return scored
    .filter((s) => s.videoIndex >= 1 && s.videoIndex <= videos.length)
    .map((s) => ({
      ...videos[s.videoIndex - 1],
      category: s.category,
      reason: s.reason,
      relevanceScore: s.relevanceScore,
      serendipityScore: s.serendipityScore,
    }));
}
