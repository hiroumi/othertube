import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OtherTube — Escape your algorithm. Borrow another perspective.",
  description:
    "いつものおすすめから抜け出して、誰かの視点でYouTubeを探索しよう。X（旧Twitter）のアカウントをAIで分析し、その人物の関心に基づいてYouTube動画を推薦します。",
  openGraph: {
    title: "OtherTube",
    description: "Escape your algorithm. Borrow another perspective.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
