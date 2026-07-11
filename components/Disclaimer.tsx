import { Info } from "lucide-react";

export default function Disclaimer() {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        公開されているプロフィールや投稿内容からAIが関心を推定しています。実際の視聴履歴を取得・表示するものではありません。
      </p>
    </div>
  );
}
