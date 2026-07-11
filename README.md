# OtherTube

**Escape your algorithm. Borrow another perspective.**

> いつものおすすめから抜け出して、誰かの視点でYouTubeを探索しよう。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/hiroumi/othertube)

---

## サービス概要

OtherTubeは、X（旧Twitter）アカウントの公開プロフィールや投稿をAIで分析し、**その人物の関心・視点に基づいてYouTube動画を推薦する**サービスです。

通常のYouTubeは自分の視聴履歴をもとに動画を推薦するため、**フィルターバブル**や**エコーチェンバー**が生まれやすい問題があります。OtherTubeは、自分とは異なる人物の視点を一時的に借りることで、普段では出会えない動画との**セレンディピティ**を生み出します。

---

## 解決したい課題

| 問題 | OtherTubeのアプローチ |
|------|----------------------|
| 自分の好みしか推薦されない | 他者の視点でYouTubeを探索 |
| フィルターバブルで視野が狭くなる | Core / Adjacent / Opposite の3視点で提示 |
| 新しいジャンルへの入口がない | AIが関心を推定し、意外性のある動画も推薦 |

---

## サービスの仕組み

```
Xアカウント入力
    ↓
X API（公開プロフィール＋最新ツイート取得）
    ↓  ※ 24時間キャッシュ（L1: メモリ / L2: Supabase）
Anthropic Claude API（関心・視点・キーワードを分析）
    ↓
YouTube Data API（関連動画を検索・取得）
    ↓
AIによるスコアリングと3カテゴリ分類
    ↓
仮想YouTubeフィードとして表示
```

---

## AI Agentの役割

1. **プロフィール分析** — 投稿テキストから関心テーマ・視点・キーワードを抽出
2. **検索クエリ生成** — パーソナライズされたYouTube検索クエリを5件生成
3. **動画スコアリング** — 各動画の関連度・意外性を0〜100で評価
4. **カテゴリ分類** — 3カテゴリに分類して視点の多様性を提供

### 推薦カテゴリ

| カテゴリ | 説明 |
|---------|------|
| **Core Interests** | 本人が明確に関心を示すテーマの動画 |
| **Adjacent Interests** | 関心分野から一歩広げた周辺領域の動画 |
| **Opposite Lens** | 異なる立場・反対意見・別の価値観の動画 |

---

## 主な機能

- **XアカウントURL入力** — `https://x.com/username` または `@username` で分析開始
- **X API自動取得** — 公開プロフィールと最新ツイート（最大20件）を自動取得
- **24時間キャッシュ** — 同一アカウントの2回目以降はX APIを呼ばずに高速返却
- **手動入力フォールバック** — X APIが使えない場合はツイートテキストを貼り付けて分析
- **デモサンプル3種** — APIキーなしで完全動作するサンプルプロフィール
- **AI処理ステップ表示** — 6段階の処理過程をリアルタイム表示
- **動画カード** — 推薦理由・関連度スコア・意外性スコアを表示
- **結果共有** — URLをクリップボードにコピー
- **レスポンシブデザイン** — PC・スマートフォン対応

---

## 技術構成

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS v4 |
| AI API | Anthropic Claude API (`claude-sonnet-4-6`) |
| 動画API | YouTube Data API v3 |
| X連携 | X API v2 (Bearer Token / App-Only) |
| キャッシュL1 | モジュールスコープ Map（インメモリ） |
| キャッシュL2 | Supabase（オプション） |
| アイコン | Lucide React |
| デプロイ | Vercel |

---

## ディレクトリ構成

```
app/
├── page.tsx                  # トップページ
├── results/page.tsx          # 結果ページ
└── api/
    ├── analyze/route.ts      # Claude API（関心プロフィール生成）
    ├── youtube/route.ts      # YouTube Data API（動画検索）
    ├── recommend/route.ts    # 動画スコアリング・分類
    └── x/route.ts            # X API（プロフィール取得＋キャッシュ）

components/
├── AccountInputForm.tsx      # 入力フォーム
├── SampleProfiles.tsx        # サンプル選択UI
├── AgentProgress.tsx         # AI処理ステップ表示
├── ProfileSummary.tsx        # 人物プロフィール表示
├── VideoCard.tsx             # 動画カード
├── VideoSection.tsx          # カテゴリ別動画セクション
└── Disclaimer.tsx            # 注意書き

lib/
├── types.ts                  # 型定義
├── anthropic.ts              # Claude API呼び出し
├── youtube.ts                # YouTube API呼び出し
├── twitter.ts                # X API呼び出し
├── cache.ts                  # L1/L2キャッシュ
├── scoring.ts                # シンプルスコアリング（フォールバック）
└── sample-data.ts            # デモ用サンプルデータ
```

---

## ローカルでの起動方法

```bash
# リポジトリのクローン
git clone https://github.com/hiroumi/othertube.git
cd othertube

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.local.example .env.local
# .env.local を編集してAPIキーを設定

# 開発サーバー起動
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

---

## 環境変数

`.env.local` に設定します（すべて任意 — 未設定でもデモ動作します）。

```env
# Anthropic Claude API — 関心プロフィール生成に使用
ANTHROPIC_API_KEY=sk-ant-...

# YouTube Data API v3 — 動画検索に使用
YOUTUBE_API_KEY=AIza...

# X API Bearer Token — 公開プロフィール・ツイート取得に使用
# ⚠️ Developer Portalからコピーした文字列をそのまま貼る（%2B %3D はデコードしない）
X_BEARER_TOKEN=AAAAAAAAA...%2B...%3D...

# Supabase — X APIレスポンスの24時間キャッシュ（任意）
# ⚠️ SUPABASE_SERVICE_ROLE_KEY はサーバー専用。絶対にNEXT_PUBLIC_を付けない
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### APIキーの取得先

| 環境変数 | 取得先 |
|---------|--------|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com/) |
| `YOUTUBE_API_KEY` | [Google Cloud Console](https://console.cloud.google.com/) → YouTube Data API v3 |
| `X_BEARER_TOKEN` | [developer.twitter.com](https://developer.twitter.com/) → アプリ → Keys & Tokens |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | [supabase.com](https://supabase.com/) → Project Settings → API |

---

## Supabaseキャッシュのセットアップ（任意）

Supabase SQL Editorで以下を実行してください。

```sql
-- X APIレスポンスキャッシュテーブル
create table x_profile_cache (
  username  text primary key,
  profile   jsonb not null,
  cached_at timestamptz not null default now()
);

-- TTLフィルタ用インデックス
create index x_profile_cache_cached_at_idx
  on x_profile_cache (cached_at);
```

設定後は同一アカウントへの2回目以降のリクエストでX APIを呼ばずにキャッシュから返します。

期限切れデータの削除（任意・定期実行）：

```sql
delete from x_profile_cache
where cached_at < now() - interval '7 days';
```

---

## Vercelへのデプロイ方法

### GitHub連携（推奨）

1. [vercel.com](https://vercel.com) でGitHubリポジトリと連携
2. Project Settings → Environment Variables に各APIキーを追加
3. `main` ブランチへのプッシュで自動デプロイ

### CLI

```bash
npm install -g vercel
vercel
```

---

## デモ用サンプルの使い方

トップページの「サンプルで試す」から3種類を選択できます。**APIキーなしで完全動作します。**

| サンプル | 人物像 |
|---------|--------|
| AI・テクノロジー | AIとスタートアップの社会実装に関心を持つ架空の人物 |
| アート・建築・デザイン | 建築・アートを通じて空間体験を探求する架空の人物 |
| 環境・生態・地域社会 | 生物多様性と地域コミュニティに関心を持つ架空の人物 |

> これらはすべて架空のデモプロフィールです。実在する人物の発言ではありません。

---

## APIキーなしの動作について

| 機能 | APIキーなし | APIキーあり |
|------|------------|------------|
| サンプルデモ | ✅ 完全動作 | ✅ 完全動作 |
| 手動テキスト入力 | ✅ 動作（フォールバック分析） | ✅ Claude分析 |
| X URL入力 | ⚠️ 手動入力へ切り替え | ✅ 自動取得 |
| YouTube動画 | ✅ サンプル動画 | ✅ 実際の動画 |
| 推薦スコアリング | ✅ シンプル計算 | ✅ AI評価 |

---

## 注意事項

- 公開されているプロフィールや投稿内容からAIが**関心を推定**しています
- 実際のYouTube**視聴履歴を取得・表示するものではありません**
- 非公開アカウントの情報にはアクセスしません
- AIによる推定であり、実際の人物の関心と異なる場合があります

---

## 今後の発展案

- **Perspective Mix** — 2人の視点を混ぜてオリジナルフィードを生成
- **マルチメディア対応** — 記事・Podcast・書籍への拡張
- **自己比較機能** — 自分の視聴傾向との違いを可視化
- **多様性の強制提示** — 複数の立場を意図的に並べて表示
- **フィードバック学習** — 推薦結果へのフィードバックで精度向上
- **グループ分析** — 複数アカウントの共通点・相違点を分析
