import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Wrench, Building2, Link2, Radio, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI工具导航 - 发现最适合你的AI工具',
  description: '收录AI工具，按行业推荐，剖析不足，搭配互补。每日更新。',
};

const navLinks = [
  { href: '/tools', label: '全部工具', icon: Wrench },
  { href: '/industries', label: '行业分类', icon: Building2 },
  { href: '/combinations', label: '搭配方案', icon: Link2 },
  { href: '/feed', label: '更新动态', icon: Radio },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 border-b border-white/[0.04] bg-[#08080d]/80 backdrop-blur-xl">
          <div className="page-container h-14 flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 font-semibold text-base group">
              <span className="w-7 h-7 rounded-md bg-white flex items-center justify-center text-[10px] font-bold text-black">AI</span>
              <span className="text-white tracking-tight">AI工具导航</span>
            </Link>
            <nav className="hidden md:flex gap-0.5">
              {navLinks.map(l => (
                <Link key={l.href} href={l.href}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-400
                             hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors">
                  <l.icon className="w-3.5 h-3.5" />
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="flex-1" />
            <form action="/search" method="GET" className="hidden sm:flex">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                  name="q" type="search" placeholder="搜索 AI 工具..."
                  className="w-52 bg-white/[0.03] border border-white/[0.06] rounded-lg pl-9 pr-3.5 py-2
                             text-sm text-zinc-200 placeholder-zinc-600
                             focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.05] transition-all"
                />
              </div>
            </form>
          </div>
        </header>
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        
        {/* 手机端底部导航 */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-white/[0.06] bg-[#08080d]/95 backdrop-blur-xl">
          <div className="flex items-center justify-around h-14">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className="flex flex-col items-center justify-center gap-0.5 text-[10px] text-zinc-500 hover:text-white transition-colors py-1 px-2">
                <l.icon className="w-4 h-4" />
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
        
        <footer className="border-t border-white/[0.04] bg-black/30 mt-16">
          <div className="page-container py-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-[9px] font-bold text-black">AI</span>
                  <span className="font-semibold text-white text-sm">AI工具导航</span>
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
                  收录全球 AI 工具，按行业场景推荐，剖析每款工具的不足，帮你找到最佳搭配方案。
                </p>
                <p className="text-xs text-zinc-600 mt-4">每日自动更新 · 内容仅供参考</p>
              </div>
              <div className="md:col-span-3">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">快速导航</h4>
                <div className="space-y-2 text-sm">
                  {navLinks.map(l => (
                    <Link key={l.href} href={l.href} className="block text-zinc-500 hover:text-white transition-colors">{l.label}</Link>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">数据来源</h4>
                <div className="space-y-1.5 text-sm text-zinc-600">
                  <p>Product Hunt</p>
                  <p>GitHub Trending</p>
                  <p>Hugging Face</p>
                  <p>量子位 · 机器之心</p>
                </div>
              </div>
              <div className="md:col-span-3">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">关注公众号</h4>
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex items-center gap-4">
                  <img
                    src="/ai-tools-directory/images/qrcode.jpg"
                    alt="公众号二维码"
                    className="w-36 h-36 rounded-xl flex-shrink-0 object-contain bg-white"
                  />
                  <div>
                    <p className="text-white font-medium text-sm">顺德馋嘴猫</p>
                    <p className="text-xs text-zinc-500 mt-1">微信扫一扫</p>
                    <p className="text-xs text-zinc-500">关注公众号</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-white/[0.03] mt-10 pt-6 text-center text-xs text-zinc-700">
              AI工具导航 &copy; 2026 — 非商业用途，内容仅供参考
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
