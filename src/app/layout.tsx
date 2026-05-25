import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI工具导航 - 发现最适合你的AI工具',
  description: '收录AI工具，按行业推荐，剖析不足，搭配互补。每日更新。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">
            <Link href="/" className="font-bold text-lg text-blue-400 hover:text-blue-300">
              AI工具导航
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/tools" className="text-slate-300 hover:text-white transition-colors">全部工具</Link>
              <Link href="/industries" className="text-slate-300 hover:text-white transition-colors">行业分类</Link>
              <Link href="/combinations" className="text-slate-300 hover:text-white transition-colors">搭配方案</Link>
              <Link href="/feed" className="text-slate-300 hover:text-white transition-colors">更新动态</Link>
            </nav>
            <div className="flex-1" />
            <form action="/search" method="GET" className="flex gap-2">
              <input
                name="q"
                type="search"
                placeholder="搜索AI工具..."
                className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-500 text-slate-200 placeholder-slate-500"
              />
            </form>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-slate-700 bg-slate-900 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
            <p>AI工具导航 — 每日更新，帮你找到最适合的AI工具</p>
            <p className="mt-1">数据来源：Product Hunt / GitHub Trending / Hugging Face / 量子位 / 机器之心</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
