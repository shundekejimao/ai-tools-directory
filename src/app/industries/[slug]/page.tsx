import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Package, ShoppingCart, PenLine, Code2, Palette, Briefcase, Video, Brain } from 'lucide-react';
import { getIndustryBySlug, getToolsByIndustry, getIndustries } from '@/lib/data';
import { catNames, priceLabel } from '@/lib/constants';
import Breadcrumb from '@/components/Breadcrumb';
import ToolIcon from '@/components/ToolIcon';

const industryIcons: Record<string, any> = {
  ecommerce: ShoppingCart, content: PenLine, programming: Code2, design: Palette,
  office: Briefcase, 'audio-video': Video, 'ai-models': Brain, 'local-offline': Package,
};

export async function generateStaticParams() {
  return getIndustries().map(i => ({ slug: i.slug }));
}

export default function IndustryDetailPage({ params }: any) {
  const industry = getIndustryBySlug(params.slug);
  if (!industry) notFound();

  const tools = getToolsByIndustry(params.slug);
  const Icon = industryIcons[industry.slug] || Package;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumb items={[
        { label: '首页', href: '/' },
        { label: '行业分类', href: '/industries' },
        { label: industry.name },
      ]} />

      <div className="flex items-center gap-4 mb-8">
        <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
          <Icon className="w-7 h-7 text-white" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-white">{industry.name}</h1>
          <p className="text-slate-400 mt-1">{industry.description} · 推荐 {tools.length} 个 AI 工具</p>
        </div>
      </div>

      {tools.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          <Package className="w-12 h-12 mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">该行业暂无推荐工具，我们会持续更新。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, i) => (
            <Link key={tool.id} href={`/tools/${tool.slug}`}
              className="group bg-slate-900/60 border border-slate-800 rounded-2xl p-5
                         hover:border-slate-600 hover:bg-slate-900/80 hover:-translate-y-0.5
                         hover:shadow-xl hover:shadow-black/10 transition-all duration-300">
              <div className="flex items-start gap-3 mb-3">
                <ToolIcon name={tool.name} index={i} />
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">{tool.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{catNames[tool.category] || tool.category}</p>
                </div>
                <span className={`badge flex-shrink-0 text-[10px] ${
                  tool.pricing_tier === 'completely_free' || tool.pricing_tier === 'open_source'
                    ? 'badge-green' : tool.pricing_tier === 'freemium' ? 'badge-yellow' : 'badge'
                }`}>{priceLabel[tool.pricing_tier] || tool.pricing_tier}</span>
              </div>
              <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{tool.description_short}</p>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {tool.tags.slice(0, 3).map(tag => (<span key={tag} className="tag">{tag}</span>))}
                {tool.china_accessible && <span className="badge-green text-[10px]">国内可用</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
