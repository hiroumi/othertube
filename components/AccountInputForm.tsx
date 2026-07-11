"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, ChevronUp, User } from "lucide-react";
import type { SourceProfile } from "@/lib/types";

interface AccountInputFormProps {
  onSubmit: (profile: SourceProfile) => void;
  isLoading: boolean;
}

export default function AccountInputForm({ onSubmit, isLoading }: AccountInputFormProps) {
  const [username, setUsername] = useState("");
  const [posts, setPosts] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [error, setError] = useState("");

  function parseUsername(raw: string): string {
    // https://x.com/username or https://twitter.com/username or @username or plain username
    const urlMatch = raw.match(/(?:x\.com|twitter\.com)\/([A-Za-z0-9_]+)/);
    if (urlMatch) return urlMatch[1];
    return raw.replace(/^@/, "").trim();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const postLines = posts
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (!username.trim() && postLines.length === 0) {
      setError("ユーザー名または投稿テキストを入力してください。");
      return;
    }

    const parsedUsername = parseUsername(username) || "unknown_user";

    if (postLines.length === 0 && !showManual) {
      setShowManual(true);
      setError("投稿テキストを貼り付けてください。Xの投稿を5〜20件ほど入力してください。");
      return;
    }

    const profile: SourceProfile = {
      username: parsedUsername,
      displayName: parsedUsername,
      posts: postLines.length > 0 ? postLines : [`@${parsedUsername}のプロフィール分析`],
      source: "manual",
    };

    onSubmit(profile);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="https://x.com/username または @username"
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm outline-none transition-all focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:opacity-50"
          disabled={isLoading}
        />
      </div>

      <button
        type="button"
        onClick={() => setShowManual(!showManual)}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        {showManual ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        投稿テキストを貼り付けて分析する（X APIなしで利用可能）
      </button>

      {showManual && (
        <div className="space-y-1">
          <textarea
            value={posts}
            onChange={(e) => setPosts(e.target.value)}
            placeholder={`Xの投稿を5〜20件ほど貼り付けてください。\n例：\n「AIの進化が止まらない。今年は本当に転換点だと感じる。」\n「新しいプロダクトのアイデアを試してみた。」\n...`}
            rows={6}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:opacity-50 resize-none"
            disabled={isLoading}
          />
          <p className="text-right text-xs text-gray-400">
            {posts.split("\n").filter(Boolean).length} 件の投稿
          </p>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-red-600 hover:to-pink-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
      >
        この人の視点を借りる
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </form>
  );
}
