import Link from 'next/link';
import { getTools, getCombinations, getIndustries } from '@/lib/data';

export default function HomePage() {
  const tools = getTools();
  const combos = getCombinations();
  const industries = getIndustries();

  const newest = [...tools].sort((a, b) => b.date_added.localeCompare(a.date_added)).slice(0, 6);
  const freeTools = tools.filter(t => t.pricing_tier === 'completely_free' || t.pricing_tier === 'open_source');

  const industryIcons: Record<string, string> = {
    ecommerce: '🛒', content: '✍️', programming: '💻', design: '🎨',
    office: '📊', 'audio-video': '🎬', 'ai-models': '🧠', 'local-offline': '📦',
  };

  const gradientColors = [
    'from-blue-500 to-cyan-500',
    'from-violet-500 to-purple-500',
    'from-emerald-500 to-teal-500',
    'from-rose-500 to-pink-500',
    'from-amber-500 to-orange-500',
    'from-sky-500 to-indigo-500',
    'from-lime-500 to-green-500',
    'from-fuchsia-500 to-rose-500',
  ];

  const catNames: Record<string, string> = {
    browser: '浏览器', image: '图像', code: '编程', voice: '语音',
    video: '视频', model: '大模型', office: '办公', ecommerce: '电商',
    design: '设计', other: '其他',
  };

  const priceLabel: Record<string, string> = {
    completely_free: '免费', open_source: '开源',
    freemium: '部分免费', paid: '付费', unknown: '未知',
  };

  return (
    <div className="hero-glow">
      <div className="max-w-7xl mx-auto px-4">

        {/* ── Hero ── */}
        <section className="text-center py-16 md:py-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            每日更新 · 已收录 {tools.length} 款 AI 工具
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="gradient-text">AI工具导航</span>
            <br />
            <span className="text-white">发现最适合你的AI工具</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            按行业场景智能推荐，深度剖析每款工具的不足，帮你找到最佳搭配方案
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/tools" className="btn-primary text-base px-8 py-3.5 rounded-xl">
              浏览全部工具
              <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/industries" className="btn-ghost text-base px-8 py-3.5 rounded-xl">按行业查找</Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">
            {[
              { value: tools.length, label: 'AI 工具' },
              { value: industries.length, label: '行业分类' },
              { value: combos.length, label: '搭配方案' },
              { value: freeTools.length, label: '免费工具' },
            ].map(s => (
              <div key={s.label} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
                <div className="text-2xl md:text-3xl font-bold gradient-text">{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Industry Quick Links ── */}
        <section className="mb-16 animate-fade-in">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="section-title">行业分类</h2>
              <p className="section-subtitle">按行业场景精准查找</p>
            </div>
            <Link href="/industries" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">全部 →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {industries.map((ind, i) => (
              <Link key={ind.slug} href={`/industries/${ind.slug}`}
                className="group bg-slate-900/60 border border-slate-800 rounded-2xl p-5
                           hover:border-slate-600 hover:bg-slate-900/80 transition-all duration-300">
                <span className="text-2xl mb-3 block">{industryIcons[ind.slug] || '📌'}</span>
                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{ind.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ind.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Newest Tools ── */}
        <section className="mb-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="section-title">最新收录</h2>
              <p className="section-subtitle">近期添加的 AI 工具</p>
            </div>
            <Link href="/tools" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">查看全部 →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newest.map((tool, i) => (
              <Link key={tool.id} href={`/tools/${tool.slug}`}
                className="group bg-slate-900/60 border border-slate-800 rounded-2xl p-5
                           hover:border-slate-600 hover:bg-slate-900/80 transition-all duration-300">
                <div className="flex items-start gap-3 mb-3">
                  <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientColors[i % gradientColors.length]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {tool.name[0]}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">{tool.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{catNames[tool.category] || tool.category}</p>
                  </div>
                  <span className={`badge flex-shrink-0 ${
                    tool.pricing_tier === 'completely_free' || tool.pricing_tier === 'open_source'
                      ? 'badge-green' : tool.pricing_tier === 'freemium'
                      ? 'badge-yellow' : 'badge'
                  }`}>{priceLabel[tool.pricing_tier] || tool.pricing_tier}</span>
                </div>
                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{tool.description_short}</p>
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {tool.tags.slice(0, 3).map(tag => (<span key={tag} className="tag">{tag}</span>))}
                  {tool.china_accessible && <span className="badge-green text-[10px]">国内可用</span>}
                  {tool.beginner_friendly && <span className="badge-blue text-[10px]">小白友好</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Free Tools ── */}
        <section className="mb-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="section-title">免费工具速查</h2>
              <p className="section-subtitle">{freeTools.length} 款完全免费或开源的工具</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {freeTools.slice(0, 8).map((tool, i) => (
              <Link key={tool.id} href={`/tools/${tool.slug}`}
                className="group bg-slate-900/60 border border-emerald-900/30 rounded-2xl p-4
                           hover:border-emerald-700/50 hover:bg-slate-900/80 transition-all duration-300">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className={`w-7 h-7 rounded-lg bg-gradient-to-br ${gradientColors[i % gradientColors.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {tool.name[0]}
                  </span>
                  <h3 className="font-medium text-sm text-white group-hover:text-emerald-400 transition-colors truncate">{tool.name}</h3>
                </div>
                <div className="flex gap-1 flex-wrap">
                  <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{catNames[tool.category] || tool.category}</span>
                  {tool.ecommerce_relevant && <span className="badge-purple text-[10px]">电商</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Combinations ── */}
        <section className="mb-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="section-title">最佳搭配方案</h2>
              <p className="section-subtitle">多工具组合取长补短，效率翻倍</p>
            </div>
            <Link href="/combinations" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">查看全部 →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {combos.map((combo, i) => (
              <Link key={combo.id} href={`/combinations/${combo.id}`}
                className="group bg-slate-900/60 border border-slate-800 rounded-2xl p-5
                           hover:border-blue-800/50 hover:bg-slate-900/80 transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{combo.title}</h3>
                  <span className="text-xl">{['⚡','🎯','💡','🔮','🚀','✨','🔥','💎'][i]}</span>
                </div>
                <p className="text-sm text-blue-400/80 font-medium mb-2">{combo.tool_chain}</p>
                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{combo.description}</p>
                <div className="flex gap-3 mt-3 text-xs">
                  {combo.time_saved && <span className="badge-blue">省时：{combo.time_saved}</span>}
                  {combo.cost_summary && <span className="badge-green">{combo.cost_summary}</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
