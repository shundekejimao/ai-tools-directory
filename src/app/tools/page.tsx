import Link from 'next/link';
import { getTools } from '@/lib/data';

export default function ToolsPage() {
  const tools = getTools();
  tools.sort((a, b) => b.date_added.localeCompare(a.date_added));

  const categories = [...new Set(tools.map(t => t.category))].sort();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-200">全部AI工具 ({tools.length})</h1>
        <Link href="/feed" className="text-sm text-blue-400 hover:text-blue-300">更新动态 →</Link>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Link
          href="/tools"
          className="px-3 py-1.5 rounded-lg text-sm bg-blue-600 text-white"
        >全部</Link>
        {categories.map(cat => (
          <Link
            key={cat}
            href={`/tools?category=${cat}`}
            className="px-3 py-1.5 rounded-lg text-sm bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
          >{cat}</Link>
        ))}
      </div>

      {/* Tool grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(tool => (
          <Link key={tool.id} href={`/tools/${tool.slug}`} className="card group">
            <div className="flex items-start justify-between mb-2">
              <h2 className="font-medium text-slate-200 group-hover:text-blue-400 transition-colors">{tool.name}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                tool.pricing_tier === 'completely_free' || tool.pricing_tier === 'open_source'
                  ? 'bg-green-900/50 text-green-400 border border-green-700'
                  : tool.pricing_tier === 'freemium'
                  ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-700'
                  : 'bg-slate-700 text-slate-400'
              }`}>
                {tool.pricing_tier === 'completely_free' ? '免费' :
                 tool.pricing_tier === 'open_source' ? '开源' :
                 tool.pricing_tier === 'freemium' ? '部分免费' : '付费'}
              </span>
            </div>
            <p className="text-sm text-slate-400 line-clamp-2 mb-3">{tool.description_short}</p>
            <div className="flex gap-1.5 flex-wrap">
              <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded">{tool.category}</span>
              {tool.china_accessible && (
                <span className="text-xs bg-green-900/30 text-green-500 px-2 py-0.5 rounded">国内可用</span>
              )}
              {tool.beginner_friendly && (
                <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded">小白友好</span>
              )}
              {tool.ecommerce_relevant && (
                <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded">电商相关</span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-3">收录于 {tool.date_added} · 更新于 {tool.date_updated}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
