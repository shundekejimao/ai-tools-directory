import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getToolBySlug, getComplementaryTools, getCombinations } from '@/lib/data';

export default function ToolDetailPage({ params }: any) {
  const tool = getToolBySlug(params.slug);
  if (!tool) notFound();

  const complementary = getComplementaryTools(params.slug);
  const allCombos = getCombinations();
  const relatedCombos = allCombos.filter(c =>
    c.tool_chain?.includes(tool.name)
  );

  const priceLabel: Record<string, string> = {
    completely_free: '完全免费', open_source: '开源免费',
    freemium: '免费+付费', paid: '付费', unknown: '未知',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-slate-300">首页</Link>
        {' / '}
        <Link href="/tools" className="hover:text-slate-300">工具</Link>
        {' / '}
        <span className="text-slate-400">{tool.name}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 mb-2">{tool.name}</h1>
            <p className="text-slate-400 text-lg">{tool.description_short}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              tool.pricing_tier === 'completely_free' || tool.pricing_tier === 'open_source'
                ? 'bg-green-900/50 text-green-400 border border-green-700'
                : tool.pricing_tier === 'freemium'
                ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-700'
                : 'bg-slate-700 text-slate-400'
            }`}>{priceLabel[tool.pricing_tier] || tool.pricing_tier}</span>
            {tool.china_accessible && (
              <span className="px-3 py-1 rounded-full text-sm bg-green-900/30 text-green-500 border border-green-800">国内可用</span>
            )}
            {tool.beginner_friendly && (
              <span className="px-3 py-1 rounded-full text-sm bg-blue-900/30 text-blue-400 border border-blue-800">小白友好</span>
            )}
            {tool.ecommerce_relevant && (
              <span className="px-3 py-1 rounded-full text-sm bg-purple-900/30 text-purple-400 border border-purple-800">电商相关</span>
            )}
          </div>
        </div>
        <div className="flex gap-1.5 mt-4 flex-wrap">
          {tool.tags.map(tag => (
            <span key={tag} className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{tag}</span>
          ))}
        </div>
      </div>

      {/* Description */}
      <section className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-200 mb-3">功能介绍</h2>
        <p className="text-slate-300 leading-relaxed">{tool.description}</p>
        {tool.features.length > 0 && (
          <ul className="mt-4 space-y-2">
            {tool.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-400">
                <span className="text-blue-400 mt-1">▸</span>
                {f}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Shortcomings */}
      <section className="card mb-6 border-red-900/30">
        <h2 className="text-lg font-semibold text-red-400 mb-3">不足之处</h2>
        {tool.shortcomings ? (
          <p className="text-slate-300 leading-relaxed">{tool.shortcomings}</p>
        ) : (
          <div className="text-slate-500">
            <p>该工具的不足分析正在整理中。</p>
            <p className="mt-2 text-sm">每个 AI 工具都有其局限性，了解不足才能更好地选择和使用。</p>
          </div>
        )}
      </section>

      {/* Complementary tools */}
      {complementary.length > 0 && (
        <section className="card mb-6 border-green-900/30">
          <h2 className="text-lg font-semibold text-green-400 mb-3">推荐搭配 — 弥补不足</h2>
          <p className="text-sm text-slate-400 mb-4">以下工具可以补充 {tool.name} 的短板，搭配使用效果更好</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {complementary.map(ct => (
              <Link key={ct.id} href={`/tools/${ct.slug}`} className="bg-slate-900 rounded-lg p-4 hover:bg-slate-800 transition-colors">
                <h3 className="font-medium text-slate-200">{ct.name}</h3>
                <p className="text-sm text-slate-400 mt-1">{ct.description_short}</p>
                <span className={`text-xs inline-block mt-2 px-2 py-0.5 rounded ${
                  ct.pricing_tier === 'completely_free' || ct.pricing_tier === 'open_source'
                    ? 'bg-green-900/30 text-green-400' : 'bg-slate-700 text-slate-400'
                }`}>{priceLabel[ct.pricing_tier] || ct.pricing_tier}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related combinations */}
      {relatedCombos.length > 0 && (
        <section className="card mb-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-3">相关搭配方案</h2>
          <div className="space-y-3">
            {relatedCombos.map(combo => (
              <Link key={combo.id} href={`/combinations/${combo.id}`} className="block bg-slate-900 rounded-lg p-4 hover:bg-slate-800 transition-colors">
                <h3 className="font-medium text-slate-200">{combo.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{combo.tool_chain}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Meta info */}
      <div className="text-sm text-slate-600 flex gap-6 flex-wrap">
        <span>收录于：{tool.date_added}</span>
        <span>最近更新：{tool.date_updated}</span>
        <span>分类：{tool.category}</span>
      </div>
    </div>
  );
}
