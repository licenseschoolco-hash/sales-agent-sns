import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SNS営業OS",
  description: "商材変更可能なSNS営業管理システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <div className="layout">
          <aside className="sidebar">
            <div className="sidebar-title">SNS営業OS</div>
            <nav>
              <Link href="/" className="nav-link">
                <span className="icon">📊</span> ダッシュボード
              </Link>
              <Link href="/products" className="nav-link">
                <span className="icon">📦</span> 商材一覧
              </Link>
              <Link href="/targets" className="nav-link">
                <span className="icon">🎯</span> ターゲット一覧
              </Link>
              <Link href="/discovery" className="nav-link">
                <span className="icon">🔍</span> ターゲット発掘
              </Link>
              <Link href="/reports" className="nav-link">
                <span className="icon">📈</span> レポート
              </Link>
            </nav>
          </aside>
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
