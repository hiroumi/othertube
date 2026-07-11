export interface SourceProfile {
  username: string;
  displayName?: string;
  bio?: string;
  posts: string[];
  source: "api" | "manual" | "sample" | "youtube";
  sourceChannelId?: string; // YouTube: exclude this channel from recommendations
}

export interface InterestProfile {
  displayName: string;
  summary: string;
  interests: string[];
  perspective: string;
  keywords: string[];
  youtubeSearchQueries: string[];
}

export interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  channelId?: string;
  publishedAt: string;
  url: string;
}

export interface RecommendedVideo extends YouTubeVideo {
  category: RecommendationCategory;
  reason: string;
  relevanceScore: number;
  serendipityScore: number;
}

export type RecommendationCategory = "core" | "adjacent" | "opposite";

export interface AnalysisResult {
  sourceProfile: SourceProfile;
  interestProfile: InterestProfile;
  videos: RecommendedVideo[];
  generatedAt: string;
}

export interface SampleProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  posts: string[];
  label: string;
  description: string;
}
