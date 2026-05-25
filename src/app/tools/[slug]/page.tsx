import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getToolBySlug, getComplementaryTools, getCombinations, getTools } from '@/lib/data';

export async function generateStaticParams() {
  return getTools().map(t => ({ slug: t.slug }));
}

const catNames: Record<string, string> = {
  browser: '浏览器', image: '图像', code: '编程', voice: '语音',
  video: '视频', model: '大模型', office: '办公', ecommerce: '电商',
  design: '设计', other: '其他',
};

const priceLabel: Record<string, string> = {
  completely_free: '完全免费', open_source: '开源免费',
  freemium: '免费+付费', paid: '付费', unknown: '未知',
};

export default function ToolDetailPage({ params }: any) {
  const tool = getToolBySlug(params.slug);
  if (!tool) notFound();

  const complementary = getComplementaryTools(params.slug);
  const allCombos = getCombinations();
  const relatedCombos = allCombos.filter(c => c.tool_chain?.includes(tool.name));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
        <Link href="/" className="hover:text-slate-300 transition-colors">首页</Link>
        <span>/</span>
        <Link href="/tools" className="hover:text-slate-300 transition-colors">工具</Link>
        <span>/</span>
        <span className="text-slate-300">{tool.name}</span>
      </nav>

      {/* Header Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 mb-8">
        <div className="flex flex-wrap items-start gap-4 justify-between">
          <div className="flex gap-4">
            <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg shadow-blue-500/25">
              {tool.name[0]}
            </span>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{tool.name}</h1>
              <p className="text-slate-400 text-base leading-relaxed">{tool.description_short}</p>
              {tool.url && (
                <a href={tool.url} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30
                              text-blue-400 hover:bg-blue-600/30 transition-all text-sm font-medium">
                  🔗 访问官网
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
        {/* Badges */}
        <div className="flex gap-2 mt-6 flex-wrap">
          <span className={`badge text-sm px-3 py-1 ${
            tool.pricing_tier === 'completely_free' || tool.pricing_tier === 'open_source'
              ? 'badge-green' : tool.pricing_tier === 'freemium'
              ? 'badge-yellow' : 'badge'
          }`}>{priceLabel[tool.pricing_tier] || tool.pricing_tier}</span>
          {tool.china_accessible && <span className="badge-green text-sm px-3 py-1">国内可用</span>}
          {tool.beginner_friendly && <span className="badge-blue text-sm px-3 py-1">小白友好</span>}
          {tool.ecommerce_relevant && <span className="badge-purple text-sm px-3 py-1">电商相关</span>}
        </div>
        {/* Tags */}
        <div className="flex gap-1.5 mt-4 flex-wrap">
          {tool.tags.map(tag => (<span key={tag} className="tag">{tag}</span>))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Features */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
              <span className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-sm">📋</span>
              功能介绍
            </h2>
            <p className="text-slate-300 leading-relaxed">{tool.description}</p>
            {tool.features.length > 0 && (
              <div className="mt-4 space-y-2">
                {tool.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-slate-400">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-400 text-[10px]">✓</span>
                    </span>
                    {f}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Shortcomings */}
          <section className="bg-red-950/20 border border-red-900/30 rounded-2xl p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-red-400 mb-4">
              <span className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center text-sm">⚠️</span>
              不足之处
            </h2>
            {tool.shortcomings ? (
              <p className="text-slate-300 leading-relaxed">{tool.shortcomings}</p>
            ) : (
              <div className="text-slate-500">
                <p>该工具的不足分析正在整理中。</p>
                <p className="mt-1.5 text-sm">每个 AI 工具都有其局限性，了解不足才能更好地选择和使用。</p>
              </div>
            )}
          </section>

          {/* Related combinations */}
          {relatedCombos.length > 0 && (
            <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                <span className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center text-sm">🔗</span>
                相关搭配方案
              </h2>
              <div className="space-y-3">
                {relatedCombos.map(combo => (
                  <Link key={combo.id} href={`/combinations/${combo.id}`}
                    className="block bg-slate-800/60 rounded-xl p-4 hover:bg-slate-800 transition-colors border border-slate-700/50">
                    <h3 className="font-medium text-white">{combo.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{combo.tool_chain}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Meta */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">基本信息</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">分类</span>
                <span className="text-slate-300">{catNames[tool.category] || tool.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">价格</span>
                <span className="text-slate-300">{priceLabel[tool.pricing_tier] || tool.pricing_tier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">收录日期</span>
                <span className="text-slate-300">{tool.date_added}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">最近更新</span>
                <span className="text-slate-300">{tool.date_updated}</span>
              </div>
              {tool.url && (
                <a href={tool.url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-center gap-1.5 btn-primary w-full mt-3 text-sm">
                  访问官网
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Complementary tools */}
          {complementary.length > 0 && (
            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide mb-4">推荐搭配</h3>
              <div className="space-y-2">
                {complementary.map(ct => (
                  <Link key={ct.id} href={`/tools/${ct.slug}`}
                    className="block bg-slate-800/60 rounded-xl p-3 hover:bg-slate-800 transition-colors border border-slate-700/50">
                    <h4 className="font-medium text-white text-sm">{ct.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{ct.description_short}</p>
                    <span className={`text-[10px] inline-block mt-1.5 px-1.5 py-0.5 rounded ${
                      ct.pricing_tier === 'completely_free' || ct.pricing_tier === 'open_source'
                        ? 'bg-emerald-950/50 text-emerald-400' : 'bg-slate-700 text-slate-400'
                    }`}>{priceLabel[ct.pricing_tier] || ct.pricing_tier}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
