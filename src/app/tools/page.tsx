import Link from 'next/link';
import { getTools } from '@/lib/data';

const gradientColors = [
  'from-blue-500 to-cyan-500', 'from-violet-500 to-purple-500',
  'from-emerald-500 to-teal-500', 'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500', 'from-sky-500 to-indigo-500',
];

const priceLabel: Record<string, string> = {
  completely_free: '免费', open_source: '开源',
  freemium: '部分免费', paid: '付费', unknown: '未知',
};

export default function ToolsPage() {
  const tools = getTools();
  tools.sort((a, b) => b.date_added.localeCompare(a.date_added));

  const categories = [...new Set(tools.map(t => t.category))].sort();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-sm">🔧</span>
          <h1 className="text-3xl font-bold text-white">全部AI工具</h1>
        </div>
        <p className="text-slate-400">共 {tools.length} 款 AI 工具，持续更新中</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-8 flex-wrap">
        <span className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white shadow-lg shadow-blue-600/25">全部</span>
        {categories.map(cat => (
          <span key={cat}
            className="px-4 py-2 rounded-xl text-sm bg-slate-800 text-slate-400 border border-slate-700/50 hover:border-slate-600 hover:text-slate-200 transition-colors cursor-pointer">
            {cat}
          </span>
        ))}
      </div>

      {/* Tool grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool, i) => (
          <Link key={tool.id} href={`/tools/${tool.slug}`}
            className="group bg-slate-900/60 border border-slate-800 rounded-2xl p-5
                       hover:border-slate-600 hover:bg-slate-900/80 transition-all duration-300">
            <div className="flex items-start gap-3 mb-3">
              <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientColors[i % gradientColors.length]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                {tool.name[0]}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">{tool.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{tool.category} · {tool.date_added}</p>
              </div>
              <span className={`badge flex-shrink-0 ${
                tool.pricing_tier === 'completely_free' || tool.pricing_tier === 'open_source'
                  ? 'badge-green' : tool.pricing_tier === 'freemium'
                  ? 'badge-yellow' : 'badge'
              }`}>{priceLabel[tool.pricing_tier] || tool.pricing_tier}</span>
            </div>
            <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-3">{tool.description_short}</p>
            <div className="flex gap-1.5 flex-wrap">
              {tool.tags.slice(0, 3).map(tag => (<span key={tag} className="tag">{tag}</span>))}
              {tool.china_accessible && <span className="badge-green text-[10px]">国内可用</span>}
              {tool.beginner_friendly && <span className="badge-blue text-[10px]">小白友好</span>}
              {tool.ecommerce_relevant && <span className="badge-purple text-[10px]">电商</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
