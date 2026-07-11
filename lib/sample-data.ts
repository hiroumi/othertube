import type { SampleProfile, InterestProfile, RecommendedVideo } from "./types";

export const SAMPLE_PROFILES: SampleProfile[] = [
  {
    id: "tech_innovator",
    username: "demo_ai_builder",
    displayName: "Sora Tanaka",
    bio: "Building AI products for real-world impact. Ex-startup founder. Passionate about the intersection of technology and society.",
    label: "AI・テクノロジー",
    description: "AI・スタートアップ・テクノロジーに関心がある人物",
    posts: [
      "生成AIの進化が想像以上に速い。今年はエージェント型AIが事業に組み込まれる転換点になりそう。",
      "スタートアップが本当に解くべき問題は何か。技術より先に、社会課題を深掘りすることが大切だと思う。",
      "GPT-4oのマルチモーダル機能を試した。音声と画像を同時に扱えるのは、プロダクト設計の幅を広げる。",
      "AIエージェントが自律的にタスクをこなす未来は、想像以上に近い。Devin、AutoGPTあたりを毎日追ってる。",
      "海外のVCが生成AIに投資する理由を分析してみた。コスト削減より、新規市場創出への期待が大きい。",
      "社会実装という観点でAIを見ると、技術の完成度より普及経路の設計のほうが難しい。",
      "OpenAIとGoogleのAI競争、2025年は面白いフェーズに入ると思う。",
      "ProductHuntで毎日新しいAIツールが出てくるのを眺めるのが習慣になった。",
      "スタートアップのピッチで一番響くのは、なぜ今この問題なのか、という問い。",
      "Claude 3.5のコーディング能力、マジで実用的になってきた。",
    ],
  },
  {
    id: "art_architect",
    username: "demo_art_design",
    displayName: "Hana Mizushima",
    bio: "Architecture, art, and the poetry of space. Exploring how design shapes human experience.",
    label: "アート・建築・デザイン",
    description: "アート・建築・デザインに関心がある人物",
    posts: [
      "ザハ・ハディドの建築を再訪。流動的な空間が人の動きをどう誘導するか、改めて考えさせられた。",
      "デザインは問題解決ではなく、問題の発見だと思う。",
      "今週はバウハウス100年展のカタログを読んでいた。機能と美しさの統合という概念が今でも新鮮。",
      "東京の路地裏の美しさ、誰かと共有したい。計画されていない空間の豊かさがある。",
      "アートディレクションの仕事で、余白の意味を改めて学んでいる。",
      "隈研吾の木材の使い方、素材と文化の融合という点で世界に通じる言語だと感じる。",
      "ミュージアムの展示デザインは、動線設計が体験の80%を決める。",
      "色彩理論を学び直している。デジタルとフィジカルで全く違う制約がある。",
      "自然素材と現代建築の組み合わせが好きで、北欧の事例をよく参照する。",
      "写真と建築の共通点は、フレームの中に何を入れ、何を除くか、という選択だと思う。",
    ],
  },
  {
    id: "eco_activist",
    username: "demo_eco_local",
    displayName: "Kaito Mori",
    bio: "Biologist & local community builder. Thinking about ecosystems, both natural and human.",
    label: "環境・生態・地域社会",
    description: "環境・生物・地域社会に関心がある人物",
    posts: [
      "地域の川で今年もホタルが飛んでいた。環境指標として、これほど分かりやすいものはない。",
      "生物多様性の損失は、気候変動と並ぶ地球規模の危機だと思う。でも報道は少ない。",
      "里山の管理が途絶えると、生態系が単純化される。人の関与が必要な自然もある。",
      "コミュニティガーデンを立ち上げた。食、生態、交流が一つの場所でつながるのが面白い。",
      "都市の緑化は見た目だけでなく、生物の移動経路として機能する必要がある。",
      "在来種と外来種の問題を地域住民に伝えるのが難しい。科学と生活感覚の橋渡しが必要。",
      "昆虫食に関心が出てきた。タンパク源の多様化という点で真剣に考えるべき時代だと思う。",
      "地域の祭りと生態系の関係、面白い論文を読んだ。文化的慣行が森を守る事例がある。",
      "再生可能エネルギーの導入で、地元の生態系への影響をどう最小化するか議論が必要。",
      "子どもたちに虫の名前を教えると、自然への親近感が一気に変わる。",
    ],
  },
];

export const SAMPLE_INTEREST_PROFILES: Record<string, InterestProfile> = {
  tech_innovator: {
    displayName: "Sora Tanaka",
    summary: "AIとスタートアップの社会実装に関心を持ち、技術の事業性と社会インパクトの両面から評価する人物",
    interests: ["生成AI", "スタートアップ", "プロダクト開発", "社会実装", "海外テクノロジー動向"],
    perspective:
      "新しい技術を、事業性と社会への影響の両面から評価する傾向があります。技術の完成度よりも、普及経路と社会実装の難しさに注目しています。",
    keywords: ["AI agent", "startup", "product development", "social impact"],
    youtubeSearchQueries: [
      "AI agents startup practical applications 2024",
      "future of software development AI impact",
      "technology social impact documentary",
      "generative AI business use cases",
      "startup founder insights fundraising",
    ],
  },
  art_architect: {
    displayName: "Hana Mizushima",
    summary: "建築・アート・デザインを通じて人間の空間体験を探求し、機能と美の統合を追求する人物",
    interests: ["建築デザイン", "現代アート", "空間体験", "バウハウス", "都市景観"],
    perspective:
      "デザインを問題解決ではなく問題の発見と捉え、余白・素材・動線といった非言語的な要素に強い関心を持っています。",
    keywords: ["architecture", "art direction", "spatial design", "Bauhaus", "urban space"],
    youtubeSearchQueries: [
      "contemporary architecture documentary Zaha Hadid",
      "Bauhaus design philosophy modern application",
      "urban space design human experience",
      "Japanese architecture wood natural materials",
      "museum exhibition design spatial storytelling",
    ],
  },
  eco_activist: {
    displayName: "Kaito Mori",
    summary: "生物学的視点と地域社会への関与から、自然生態系と人間コミュニティの共生を模索する人物",
    interests: ["生物多様性", "里山管理", "コミュニティ形成", "環境教育", "地域エコシステム"],
    perspective:
      "科学的知識と地域住民の生活感覚を橋渡しすることに関心を持ち、自然環境への関与が必要な場合もあると認識しています。",
    keywords: ["biodiversity", "ecosystem", "community", "satoyama", "environmental education"],
    youtubeSearchQueries: [
      "biodiversity loss ecosystem collapse documentary",
      "satoyama landscape traditional Japanese land management",
      "community garden urban ecosystem",
      "insect ecology food system future protein",
      "rewilding nature restoration case study",
    ],
  },
};

export const SAMPLE_VIDEOS: RecommendedVideo[] = [
  // tech_innovator videos
  {
    videoId: "sample_tech_1",
    title: "The AI Revolution: How Generative AI is Transforming Businesses",
    description: "A deep dive into how companies are using generative AI to create new business models.",
    thumbnail: "https://img.youtube.com/vi/aircAruvnKk/mqdefault.jpg",
    channelTitle: "TED",
    publishedAt: "2024-03-15T00:00:00Z",
    url: "https://www.youtube.com/results?search_query=AI+generative+business+transformation",
    category: "core",
    reason:
      "この人物は生成AIの事業活用に強い関心を示しています。この動画はAI技術の社会実装と事業変革を具体的に解説しており、関心に直接合致します。",
    relevanceScore: 95,
    serendipityScore: 30,
  },
  {
    videoId: "sample_tech_2",
    title: "How AI Agents Will Change the Way We Work",
    description: "Exploring the future of autonomous AI agents in professional environments.",
    thumbnail: "https://img.youtube.com/vi/l0GgTNS_-aI/mqdefault.jpg",
    channelTitle: "Stanford University",
    publishedAt: "2024-05-20T00:00:00Z",
    url: "https://www.youtube.com/results?search_query=AI+agents+future+work+autonomous",
    category: "core",
    reason:
      "AIエージェントへの関心が投稿から明確に読み取れます。スタンフォード大学の研究者が自律型AIエージェントの未来を解説しており、技術と社会実装の両面を扱っています。",
    relevanceScore: 92,
    serendipityScore: 25,
  },
  {
    videoId: "sample_tech_3",
    title: "Why Most Startups Fail: Lessons from 1000+ Founders",
    description: "Analyzing patterns in startup failure and what the most successful founders did differently.",
    thumbnail: "https://img.youtube.com/vi/MT7qH1b1Grs/mqdefault.jpg",
    channelTitle: "Y Combinator",
    publishedAt: "2024-01-10T00:00:00Z",
    url: "https://www.youtube.com/results?search_query=startup+failure+lessons+YCombinator",
    category: "adjacent",
    reason:
      "スタートアップへの関心が高い人物に対し、起業家の視点を深める内容です。技術よりも事業モデルと組織に焦点を当てており、視野を広げます。",
    relevanceScore: 78,
    serendipityScore: 55,
  },
  {
    videoId: "sample_tech_4",
    title: "The Case Against Technology Optimism",
    description: "A critical examination of how technology sometimes creates more problems than it solves.",
    thumbnail: "https://img.youtube.com/vi/P18UI35s9qU/mqdefault.jpg",
    channelTitle: "Big Think",
    publishedAt: "2024-02-28T00:00:00Z",
    url: "https://www.youtube.com/results?search_query=technology+pessimism+critique+society",
    category: "opposite",
    reason:
      "テクノロジー楽観主義とは対立する視点を提供します。社会実装に関心を持つ人物にとって、技術批判の視点は盲点を補う重要な視野となります。",
    relevanceScore: 62,
    serendipityScore: 88,
  },

  // art_architect videos
  {
    videoId: "sample_art_1",
    title: "Zaha Hadid: The Architecture of Motion",
    description: "Exploring the revolutionary architectural philosophy of Zaha Hadid and her lasting legacy.",
    thumbnail: "https://img.youtube.com/vi/nHLhgCfODYI/mqdefault.jpg",
    channelTitle: "Architectural Digest",
    publishedAt: "2024-04-05T00:00:00Z",
    url: "https://www.youtube.com/results?search_query=Zaha+Hadid+architecture+documentary",
    category: "core",
    reason:
      "ザハ・ハディドの建築への言及が投稿に見られます。この動画は流動的空間の設計哲学を詳細に解説しており、人物の関心に直接対応しています。",
    relevanceScore: 96,
    serendipityScore: 22,
  },
  {
    videoId: "sample_art_2",
    title: "Bauhaus: Art as Life - Full Documentary",
    description: "A comprehensive look at the Bauhaus movement and its influence on modern design.",
    thumbnail: "https://img.youtube.com/vi/fXIqKiF7fBU/mqdefault.jpg",
    channelTitle: "DW Documentary",
    publishedAt: "2024-01-22T00:00:00Z",
    url: "https://www.youtube.com/results?search_query=Bauhaus+documentary+design+art+history",
    category: "core",
    reason:
      "バウハウスへの強い関心が投稿から読み取れます。機能と美の統合というテーマを歴史的視点から解説するドキュメンタリーです。",
    relevanceScore: 94,
    serendipityScore: 28,
  },
  {
    videoId: "sample_art_3",
    title: "How Music Shapes Architecture (and Vice Versa)",
    description: "The surprising connections between sound and space in architectural design.",
    thumbnail: "https://img.youtube.com/vi/xHVLMfMk0vQ/mqdefault.jpg",
    channelTitle: "The B1M",
    publishedAt: "2024-03-08T00:00:00Z",
    url: "https://www.youtube.com/results?search_query=music+architecture+sound+space+design",
    category: "adjacent",
    reason:
      "空間体験への関心を音楽という別の感覚軸から探求します。建築とデザインの視野を聴覚的な次元に広げる一歩踏み出した内容です。",
    relevanceScore: 72,
    serendipityScore: 70,
  },
  {
    videoId: "sample_art_4",
    title: "Why Brutalism is Coming Back",
    description: "The controversial architectural style that was once despised is now experiencing a revival.",
    thumbnail: "https://img.youtube.com/vi/cXfU8LcHqTs/mqdefault.jpg",
    channelTitle: "Vox",
    publishedAt: "2024-02-14T00:00:00Z",
    url: "https://www.youtube.com/results?search_query=brutalism+architecture+revival+why",
    category: "opposite",
    reason:
      "有機的・流動的な建築を好む傾向とは対照的な、コンクリートの力強さを主張するブルータリズムの視点を提供します。",
    relevanceScore: 58,
    serendipityScore: 85,
  },

  // eco_activist videos
  {
    videoId: "sample_eco_1",
    title: "The Sixth Mass Extinction: What We Can Still Do",
    description: "Scientists explain the current biodiversity crisis and pathways to prevention.",
    thumbnail: "https://img.youtube.com/vi/B4H7QuBWZKY/mqdefault.jpg",
    channelTitle: "PBS Terra",
    publishedAt: "2024-04-18T00:00:00Z",
    url: "https://www.youtube.com/results?search_query=sixth+mass+extinction+biodiversity+documentary",
    category: "core",
    reason:
      "生物多様性の損失への強い関心が投稿から読み取れます。科学者が解説する絶滅危機の実態と対策は、この人物の関心の核心に触れます。",
    relevanceScore: 97,
    serendipityScore: 20,
  },
  {
    videoId: "sample_eco_2",
    title: "Japan's Satoyama: Nature's Secret Keepers",
    description: "How traditional Japanese countryside landscapes became models for biodiversity conservation.",
    thumbnail: "https://img.youtube.com/vi/7Hj4KFnRWxk/mqdefault.jpg",
    channelTitle: "NHK World",
    publishedAt: "2024-02-02T00:00:00Z",
    url: "https://www.youtube.com/results?search_query=satoyama+Japan+biodiversity+traditional+landscape",
    category: "core",
    reason:
      "里山管理への言及が複数の投稿に見られます。日本の伝統的な里山管理が生物多様性保全のモデルになっている事例を紹介する動画です。",
    relevanceScore: 93,
    serendipityScore: 32,
  },
  {
    videoId: "sample_eco_3",
    title: "Urban Farming Revolution: Cities Growing Their Own Food",
    description: "How urban agriculture is transforming city spaces and local food systems.",
    thumbnail: "https://img.youtube.com/vi/mHLnv5gM3HA/mqdefault.jpg",
    channelTitle: "Vice",
    publishedAt: "2024-03-25T00:00:00Z",
    url: "https://www.youtube.com/results?search_query=urban+farming+city+food+community",
    category: "adjacent",
    reason:
      "コミュニティガーデンへの取り組みから、都市農業という隣接領域に視野を広げます。食・生態・コミュニティの交差点への関心に応える内容です。",
    relevanceScore: 80,
    serendipityScore: 52,
  },
  {
    videoId: "sample_eco_4",
    title: "The Case for Nuclear Power in a Climate Emergency",
    description: "Environmental scientists make the controversial argument for nuclear energy as a green solution.",
    thumbnail: "https://img.youtube.com/vi/N-yALPEpV4w/mqdefault.jpg",
    channelTitle: "DW Documentary",
    publishedAt: "2024-01-30T00:00:00Z",
    url: "https://www.youtube.com/results?search_query=nuclear+power+climate+environment+case+for",
    category: "opposite",
    reason:
      "再生可能エネルギーへの関心とは異なる視点として、原子力エネルギーを環境解決策として提示します。エネルギー選択の多様な視点を得られます。",
    relevanceScore: 55,
    serendipityScore: 90,
  },
];

export function getSampleVideosForProfile(profileId: string): RecommendedVideo[] {
  const profileMap: Record<string, string[]> = {
    tech_innovator: ["sample_tech_1", "sample_tech_2", "sample_tech_3", "sample_tech_4"],
    art_architect: ["sample_art_1", "sample_art_2", "sample_art_3", "sample_art_4"],
    eco_activist: ["sample_eco_1", "sample_eco_2", "sample_eco_3", "sample_eco_4"],
  };

  const ids = profileMap[profileId] ?? profileMap["tech_innovator"];
  return SAMPLE_VIDEOS.filter((v) => ids.includes(v.videoId));
}
