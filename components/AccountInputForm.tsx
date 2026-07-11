"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, ChevronUp, User } from "lucide-react";
import type { SourceProfile } from "@/lib/types";

interface AccountInputFormProps {
  onSubmit: (profile: SourceProfile) => void;
  isLoading: boolean;
  forceShowManual?: boolean;
  externalError?: string;
}

export default function AccountInputForm({
  onSubmit,
  isLoading,
  forceShowManual = false,
  externalError = "",
}: AccountInputFormProps) {
  const [username, setUsername] = useState("");
  const [posts, setPosts] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [error, setError] = useState("");

  const showManual = manualOpen || forceShowManual;

  function parseUsername(raw: string): string {
    const urlMatch = raw.match(/(?:x\.com|twitter\.com)\/([A-Za-z0-9_]+)/);
    if (urlMatch) return urlMatch[1];
    return raw.replace(/^@/, "").trim();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsedUsername = parseUsername(username);
    const postLines = posts
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (!parsedUsername) {
      setError("XアカウントのURLまたはユーザー名を入力してください。");
      return;
    }

    const profile: SourceProfile = {
      username: parsedUsername,
      displayName: parsedUsername,
      posts: postLines,
      source: postLines.length > 0 ? "manual" : "api",
    };

    onSubmit(profile);
  }

  const displayError = error || externalError;

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
        onClick={() => setManualOpen(!manualOpen)}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        {showManual ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        投稿テキストを手動で貼り付ける（X APIが使えない場合）
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

      {displayError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{displayError}</p>
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
