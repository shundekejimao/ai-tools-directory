import Link from 'next/link';
import { Radio, ArrowRight, Wrench, Link2, PenLine, Building2 } from 'lucide-react';
import { getChangelog, getTools } from '@/lib/data';
import PageHeader from '@/components/PageHeader';

const iconMap: Record<string, any> = {
  tool: Wrench, combination: Link2, article: PenLine, industry: Building2,
};

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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader icon={Radio} title="更新动态" subtitle={`最近更新：${lastUpdated} · 每日自动刷新`} />

      {dates.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-12 text-center">
          <Radio className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
          <p className="text-zinc-400">暂无更新记录。</p>
        </div>
      ) : (
        <div className="space-y-8">
          {dates.map(date => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-zinc-500 mb-4 sticky top-16 bg-[#08080d]/80 backdrop-blur py-2 z-10">
                {date}
              </h2>
              <div className="space-y-2">
                {grouped[date].map(entry => {
                  const Icon = iconMap[entry.entity_type] || PenLine;
                  return (
                    <div key={entry.id}
                      className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4
                                 hover:border-white/[0.1] transition-all duration-200 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-zinc-500" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-zinc-300 truncate">{entry.change_desc}</p>
                        <p className="text-xs text-zinc-600 mt-0.5">{entry.changed_at}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-12">
        <Link href="/tools" className="btn-primary">
          浏览全部工具
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
