import Link from 'next/link';
import { getChangelog, getTools } from '@/lib/data';

export default function FeedPage() {
  const entries = getChangelog(30);
  const tools = getTools();

  const grouped: Record<string, typeof entries> = {};
  for (const e of entries) {
    const date = e.changed_at.substring(0, 10);
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(e);
  }

  const dates = Object.keys(grouped).sort().reverse();

  const lastUpdated = tools.length > 0
    ? tools.reduce((max, t) => t.date_updated > max ? t.date_updated : max, tools[0].date_updated)
    : '2026-05-25';

  const iconMap: Record<string, string> = {
    tool: '🔧', combination: '🔗', article: '📝', industry: '🏭',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center text-sm">📡</span>
          <h1 className="text-3xl font-bold text-white">更新动态</h1>
        </div>
        <p className="text-slate-400">最近更新：{lastUpdated} · 每日自动刷新</p>
      </div>

      {dates.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          <span className="text-4xl block mb-3">📡</span>
          暂无更新记录。
        </div>
      ) : (
        <div className="space-y-8">
          {dates.map(date => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-slate-500 mb-4 sticky top-16 bg-slate-950/80 backdrop-blur py-2 z-10">
                {date}
              </h2>
              <div className="space-y-2">
                {grouped[date].map(entry => (
                  <div key={entry.id}
                    className="bg-slate-900/60 border border-slate-800 rounded-xl p-4
                               hover:border-slate-700 transition-all duration-200 flex items-center gap-3">
                    <span className="text-lg flex-shrink-0">{iconMap[entry.entity_type] || '📌'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 truncate">{entry.change_desc}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{entry.changed_at}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-12">
        <Link href="/tools" className="btn-primary">浏览全部工具</Link>
      </div>
    </div>
  );
}
