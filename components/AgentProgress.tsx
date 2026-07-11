"use client";

import { CheckCircle, Circle, Loader } from "lucide-react";

const STEPS = [
  "公開プロフィールを読み取っています",
  "投稿から関心テーマを抽出しています",
  "YouTube検索プランを作成しています",
  "動画候補を探索しています",
  "関連度と意外性を評価しています",
  "仮想YouTubeフィードを生成しています",
];

interface AgentProgressProps {
  currentStep: number;
}

export default function AgentProgress({ currentStep }: AgentProgressProps) {
  return (
    <div className="mx-auto max-w-md animate-in fade-in rounded-2xl border border-gray-200 bg-white p-6 shadow-lg duration-500">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
        <span className="text-sm font-semibold text-gray-700">AI Agent 処理中</span>
      </div>

      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const isDone = i < currentStep;
          const isActive = i === currentStep;

          return (
            <div
              key={step}
              className={`flex items-center gap-3 transition-all duration-300 ${
                isDone ? "text-gray-500" : isActive ? "text-gray-900" : "text-gray-300"
              }`}
            >
              {isDone ? (
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
              ) : isActive ? (
                <Loader className="h-5 w-5 shrink-0 animate-spin text-red-500" />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-gray-200" />
              )}
              <span className={`text-sm ${isActive ? "font-medium" : ""}`}>{step}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-700"
          style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
