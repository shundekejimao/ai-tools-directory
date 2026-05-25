import Link from 'next/link';
import { ArrowRight, ShoppingCart, PenLine, Code2, Palette, Briefcase, Video, Brain, Package } from 'lucide-react';
import { getTools, getCombinations, getIndustries } from '@/lib/data';
import { gradientColors } from '@/lib/constants';
import SectionHeader from '@/components/SectionHeader';
import ToolCard from '@/components/ToolCard';
import ToolIcon from '@/components/ToolIcon';

const industryIcons: Record<string, any> = {
  ecommerce: ShoppingCart, content: PenLine, programming: Code2, design: Palette,
  office: Briefcase, 'audio-video': Video, 'ai-models': Brain, 'local-offline': Package,
};

export default function HomePage() {
  const tools = getTools();
  const combos = getCombinations();
  const industries = getIndustries();

  const newest = [...tools].sort((a, b) => b.date_added.localeCompare(a.date_added)).slice(0, 6);
  const freeTools = tools.filter(t => t.pricing_tier === 'completely_free' || t.pricing_tier === 'open_source');

  return (
    <div className="hero-glow">
      <div className="max-w-7xl mx-auto px-4">

        {/* Hero */}
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
              <ArrowRight className="w-4 h-4" />
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

        {/* Industry Quick Links */}
        <section className="mb-16 animate-fade-in">
          <SectionHeader title="行业分类" subtitle="按行业场景精准查找" href="/industries" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {industries.map((ind, i) => {
              const Icon = industryIcons[ind.slug] || Package;
              return (
                <Link key={ind.slug} href={`/industries/${ind.slug}`}
                  className="group bg-slate-900/60 border border-slate-800 rounded-2xl p-5
                             hover:border-slate-600 hover:bg-slate-900/80 hover:-translate-y-0.5
                             hover:shadow-xl hover:shadow-black/10 transition-all duration-300">
                  <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientColors[i % gradientColors.length]} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </span>
                  <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{ind.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ind.description}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Newest Tools */}
        <section className="mb-16">
          <SectionHeader title="最新收录" subtitle="近期添加的 AI 工具" href="/tools" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newest.map((tool, i) => (
              <ToolCard key={tool.id} tool={tool} index={i} />
            ))}
          </div>
        </section>

        {/* Free Tools */}
        <section className="mb-16">
          <SectionHeader title="免费工具速查" subtitle={`${freeTools.length} 款完全免费或开源的工具`} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {freeTools.slice(0, 8).map((tool, i) => (
              <ToolCard key={tool.id} tool={tool} index={i} variant="free" />
            ))}
          </div>
        </section>

        {/* Combinations */}
        <section className="mb-16">
          <SectionHeader title="最佳搭配方案" subtitle="多工具组合取长补短，效率翻倍" href="/combinations" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {combos.map((combo, i) => {
              const emojis = ['⚡','🎯','💡','🔮','🚀','✨','🔥','💎'];
              return (
                <Link key={combo.id} href={`/combinations/${combo.id}`}
                  className="group bg-slate-900/60 border border-slate-800 rounded-2xl p-5
                             hover:border-blue-800/50 hover:bg-slate-900/80 hover:-translate-y-0.5
                             hover:shadow-xl hover:shadow-black/10 transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{combo.title}</h3>
                    <span className="text-xl">{emojis[i]}</span>
                  </div>
                  <p className="text-sm text-blue-400/80 font-medium mb-2">{combo.tool_chain}</p>
                  <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{combo.description}</p>
                  <div className="flex gap-3 mt-3 text-xs">
                    {combo.time_saved && <span className="badge-blue">省时：{combo.time_saved}</span>}
                    {combo.cost_summary && <span className="badge-green">{combo.cost_summary}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
