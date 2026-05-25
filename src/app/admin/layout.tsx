export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/admin" className="font-bold text-slate-200">管理后台</a>
          <nav className="flex gap-4 text-sm">
            <a href="/admin" className="text-slate-400 hover:text-slate-200">仪表盘</a>
            <a href="/admin/tools" className="text-slate-400 hover:text-slate-200">工具管理</a>
            <a href="/" className="text-slate-500 hover:text-slate-300">← 返回网站</a>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
