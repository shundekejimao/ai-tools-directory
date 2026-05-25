import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI工具导航 - 发现最适合你的AI工具',
  description: '收录AI工具，按行业推荐，剖析不足，搭配互补。每日更新。',
};

const navLinks = [
  { href: '/tools', label: '全部工具', icon: '🔧' },
  { href: '/industries', label: '行业分类', icon: '🏭' },
  { href: '/combinations', label: '搭配方案', icon: '🔗' },
  { href: '/feed', label: '更新动态', icon: '📡' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg group">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-sm">AI</span>
              <span className="gradient-text">AI工具导航</span>
            </Link>
            <nav className="hidden md:flex gap-1">
              {navLinks.map(l => (
                <Link key={l.href} href={l.href}
                  className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="flex-1" />
            <form action="/search" method="GET" className="hidden sm:flex">
              <div className="relative">
                <input
                  name="q" type="search" placeholder="搜索 AI 工具..."
                  className="w-56 bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm
                             text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500
                             focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-800/80 bg-slate-950/50 mt-16">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-xs font-bold">AI</span>
                  <span className="font-bold text-white">AI工具导航</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">收录全球 AI 工具，按行业场景推荐，剖析每款工具的不足，帮你找到最佳搭配方案。</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-3">快速导航</h4>
                <div className="grid grid-cols-2 gap-1.5 text-sm">
                  {navLinks.map(l => (
                    <Link key={l.href} href={l.href} className="text-slate-400 hover:text-white transition-colors py-1">{l.label}</Link>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-3">数据来源</h4>
                <p className="text-sm text-slate-500 leading-relaxed">Product Hunt · GitHub Trending · Hugging Face · 量子位 · 机器之心</p>
                <p className="text-xs text-slate-600 mt-3">每日自动更新 · 内容仅供参考</p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
