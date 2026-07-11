# OtherTube

**Escape your algorithm. Borrow another perspective.**

いつものおすすめから抜け出して、誰かの視点でYouTubeを探索しよう。

---

## サービス概要

OtherTubeは、ユーザーが入力したX（旧Twitter）アカウントの公開プロフィールや投稿内容をAIで分析し、その人物の関心・視点に基づいてYouTube動画を推薦するサービスです。

## 解決したい課題

通常のYouTubeは自分自身の視聴履歴をもとに動画を推薦するため、関心が偏り、**フィルターバブル**や**エコーチェンバー**が発生しやすい問題があります。

OtherTubeでは、自分とは異なる人物の視点を一時的に借りることで、普段の自分では見つけられない動画との偶然の出会い（**セレンディピティ**）を生み出します。

## サービスの仕組み

1. **入力**: XアカウントのURL・ユーザー名・投稿テキスト、またはサンプルプロフィールを選択
2. **AI分析**: Anthropic Claude APIが公開情報から関心・視点・キーワードを推定
3. **動画検索**: YouTube Data APIで関連動画を取得
4. **分類・推薦**: 動画を3カテゴリに分類して提示
   - **Core Interests**: 本人が明確に関心を示すテーマの動画
   - **Adjacent Interests**: 関心分野から一歩広がった周辺領域
   - **Opposite Lens**: 異なる立場・反対意見・別の価値観

## AI Agentの役割

- **プロフィール分析**: 投稿テキストから関心テーマ・視点・キーワードを抽出
- **検索クエリ生成**: パーソナライズされたYouTube検索クエリを5件生成
- **動画スコアリング**: 各動画の関連度（relevanceScore）と意外性（serendipityScore）を0-100で評価
- **カテゴリ分類**: Core / Adjacent / Opposite の3カテゴリに分類

## 主な機能

- XアカウントURL・ユーザー名からの分析
- Xの投稿テキスト手動入力による分析（X APIなしで利用可能）
- デモ用サンプル3種類（APIキーなしで完全動作）
- AI Agent処理ステップのリアルタイム表示
- 動画カードに推薦理由・関連度・意外性スコアを表示
- 結果のURL共有（クリップボードコピー）
- レスポンシブデザイン（PC・スマートフォン対応）

## 技術構成

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS v4 |
| AI API | Anthropic Claude API (claude-sonnet-4-6) |
| 動画API | YouTube Data API v3 |
| アイコン | Lucide React |
| デプロイ | Vercel |

## ローカルでの起動方法

```bash
# リポジトリのクローン
git clone https://github.com/hiroumi/othertube.git
cd othertube

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.local.example .env.local
# .env.local を編集してAPIキーを設定（任意）

# 開発サーバー起動
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## 環境変数

`.env.local` に以下を設定してください（すべて任意）。

```env
# Anthropic Claude API（プロフィール分析に使用）
ANTHROPIC_API_KEY=

# YouTube Data API v3（動画検索に使用）
YOUTUBE_API_KEY=

# X (Twitter) API Bearer Token（オプション・将来実装）
X_BEARER_TOKEN=
```

**APIキーなしでも動作します。** サンプルデータを使用したデモモードで完全に体験できます。

## Vercelへのデプロイ方法

```bash
# Vercel CLIをインストール
npm install -g vercel

# デプロイ
vercel

# または GitHubリポジトリをVercelと連携してCI/CDを設定
```

Vercelダッシュボードで環境変数を設定してください：
- `ANTHROPIC_API_KEY`
- `YOUTUBE_API_KEY`

## デモ用サンプルの使い方

トップページの「サンプルで試す」ボタンから以下の3つのサンプルプロフィールを選択できます。

| サンプル | 説明 |
|---------|------|
| AI・テクノロジー | AIとスタートアップの社会実装に関心を持つ架空の人物 |
| アート・建築・デザイン | 建築・アートを通じて空間体験を探求する架空の人物 |
| 環境・生態・地域社会 | 生物多様性と地域コミュニティに関心を持つ架空の人物 |

**これらはすべて架空のデモプロフィールです。実在する人物の発言ではありません。**

## 注意事項

OtherTubeは、X（旧Twitter）の**公開プロフィールや投稿内容**からAIが関心を推定しています。

- 実際のYouTube視聴履歴を取得・表示するものではありません
- 非公開アカウントの情報にはアクセスしません
- AIによる推定であり、実際の人物の関心と異なる場合があります
- サンプルデータは架空の人物として作成されています

## 今後の発展案

- **Perspective Mix**: 2人の人物の視点を混ぜて独自のフィードを生成
- **マルチメディア対応**: YouTube以外の記事・Podcast・書籍への対応
- **自己比較機能**: ユーザー自身の視聴傾向との違いを可視化
- **多様性の強制提示**: 複数の立場・価値観を意図的に提示する機能
- **フィードバック学習**: 推薦結果に対するフィードバックで精度向上
- **グループ分析**: 複数アカウントの共通関心と相違点を分析
