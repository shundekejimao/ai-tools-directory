import Link from 'next/link';
import { getChangelog, getTools } from '@/lib/data';

export default function FeedPage() {
  const entries = getChangelog(30);
  const tools = getTools();

  // Group entries by date
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-200">更新动态</h1>
        <span className="text-sm text-slate-500">最近更新：{lastUpdated}</span>
      </div>

      {dates.length === 0 ? (
        <div className="card text-center text-slate-500 py-12">暂无更新记录。</div>
      ) : (
        <div className="space-y-8">
          {dates.map(date => (
            <div key={date}>
              <h2 className="text-sm font-medium text-slate-500 mb-3 sticky top-14 bg-slate-900/80 backdrop-blur py-1">{date}</h2>
              <div className="space-y-2">
                {grouped[date].map(entry => (
                  <div key={entry.id} className="card flex items-center gap-3 py-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    <div>
                      <span className="text-slate-300">{entry.change_desc}</span>
                      <span className="text-xs text-slate-600 ml-3">{entry.changed_at}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-12">
        <Link href="/tools" className="btn-primary">浏览全部工具 →</Link>
      </div>
    </div>
  );
}
