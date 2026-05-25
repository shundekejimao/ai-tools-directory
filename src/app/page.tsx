import Link from 'next/link';
import { getTools, getCombinations, getIndustries } from '@/lib/data';

export default function HomePage() {
  const tools = getTools();
  const combos = getCombinations();
  const industries = getIndustries();

  const newest = [...tools].sort((a, b) => b.date_added.localeCompare(a.date_added)).slice(0, 6);
  const freeTools = tools.filter(t => t.pricing_tier === 'completely_free' || t.pricing_tier === 'open_source').slice(0, 8);

  const catLabel: Record<string, string> = {
    ecommerce: '电商', content: '内容创作', programming: '编程开发',
    design: '设计创意', office: '办公效率', 'audio-video': '音频视频',
    'ai-models': 'AI大模型', 'local-offline': '本地/离线',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-blue-400">AI工具导航</span>
          <span className="text-slate-300"> — 发现最适合你的AI工具</span>
        </h1>
        <p className="text-slate-400 text-lg mb-8">
          收录 {tools.length}+ AI工具 · 按行业推荐 · 剖析不足 · 搭配互补 · 每日更新
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/tools" className="btn-primary text-lg px-6 py-3">浏览全部工具</Link>
          <Link href="/industries" className="btn bg-slate-700 hover:bg-slate-600 text-slate-200 text-lg px-6 py-3">按行业查找</Link>
        </div>
      </section>

      {/* Industry quick links */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4 text-slate-200">行业分类</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {industries.map(ind => (
            <Link
              key={ind.slug}
              href={`/industries/${ind.slug}`}
              className="card hover:border-blue-500/50 transition-colors"
            >
              <h3 className="font-medium text-slate-200">{ind.name}</h3>
              <p className="text-sm text-slate-400 mt-1">{ind.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Newest tools */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-200">最新收录</h2>
          <Link href="/tools" className="text-sm text-blue-400 hover:text-blue-300">查看全部 →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {newest.map(tool => (
            <Link key={tool.id} href={`/tools/${tool.slug}`} className="card group">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-slate-200 group-hover:text-blue-400 transition-colors">{tool.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  tool.pricing_tier === 'completely_free' || tool.pricing_tier === 'open_source'
                    ? 'bg-green-900/50 text-green-400 border border-green-700'
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {tool.pricing_tier === 'completely_free' ? '免费' :
                   tool.pricing_tier === 'open_source' ? '开源' :
                   tool.pricing_tier === 'freemium' ? '部分免费' : '付费'}
                </span>
              </div>
              <p className="text-sm text-slate-400 line-clamp-2">{tool.description_short}</p>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {tool.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded">{tag}</span>
                ))}
                {tool.china_accessible && (
                  <span className="text-xs bg-green-900/30 text-green-500 px-2 py-0.5 rounded">国内可用</span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-3">收录于 {tool.date_added}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Free tools quick reference */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4 text-slate-200">免费工具速查</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {freeTools.map(tool => (
            <Link key={tool.id} href={`/tools/${tool.slug}`} className="card group">
              <h3 className="font-medium text-sm text-slate-200 group-hover:text-blue-400 transition-colors">{tool.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{tool.category}</p>
              {tool.ecommerce_relevant && <span className="badge-blue text-xs mt-2 inline-block">电商相关</span>}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured combinations */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-200">最佳搭配方案</h2>
          <Link href="/combinations" className="text-sm text-blue-400 hover:text-blue-300">查看全部 →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {combos.slice(0, 4).map(combo => (
            <Link key={combo.id} href={`/combinations/${combo.id}`} className="card group">
              <h3 className="font-medium text-slate-200 group-hover:text-blue-400 transition-colors">{combo.title}</h3>
              <p className="text-sm text-slate-400 mt-1">{combo.tool_chain}</p>
              <div className="flex gap-3 mt-2 text-xs text-slate-500">
                {combo.time_saved && <span>省时：{combo.time_saved}</span>}
                {combo.cost_summary && <span className="text-green-500">{combo.cost_summary}</span>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Last updated */}
      <div className="text-center text-xs text-slate-600 py-4 border-t border-slate-800">
        最后更新：2026-05-26 · 数据每日自动刷新
      </div>
    </div>
  );
}
