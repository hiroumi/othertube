"use client";

import { useState } from "react";
import { PlaySquare, ArrowRight } from "lucide-react";

interface YouTubeInputFormProps {
  onSubmit: (channelInput: string) => void;
  isLoading: boolean;
  externalError?: string;
}

export default function YouTubeInputForm({
  onSubmit,
  isLoading,
  externalError,
}: YouTubeInputFormProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const displayError = externalError || error;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      setError("チャンネルURLまたは@ハンドルを入力してください。");
      return;
    }
    setError("");
    onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <PlaySquare className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-400" />
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError("");
          }}
          placeholder="https://www.youtube.com/@channel または @handle"
          disabled={isLoading}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none ring-0 transition focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:opacity-50"
        />
      </div>

      {displayError && (
        <p className="text-xs text-red-500">{displayError}</p>
      )}

      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        クリエイターの視点で探す
        <ArrowRight className="h-4 w-4" />
      </button>

      <p className="text-center text-xs text-gray-400">
        例：@mkbhd / https://www.youtube.com/@TED
      </p>
    </form>
  );
}
