import Link from 'next/link';
import { Building2, ShoppingCart, PenLine, Code2, Palette, Briefcase, Video, Brain, Package } from 'lucide-react';
import { getIndustries, getToolsByIndustry } from '@/lib/data';
import { gradientColors } from '@/lib/constants';
import PageHeader from '@/components/PageHeader';

const industryIcons: Record<string, any> = {
  ecommerce: ShoppingCart, content: PenLine, programming: Code2, design: Palette,
  office: Briefcase, 'audio-video': Video, 'ai-models': Brain, 'local-offline': Package,
};

export default function IndustriesPage() {
  const industries = getIndustries();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader icon={Building2} title="行业分类" subtitle="按行业场景查找最适合的AI工具组合" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {industries.map((ind, i) => {
          const tools = getToolsByIndustry(ind.slug);
          const Icon = industryIcons[ind.slug] || Package;
          return (
            <Link key={ind.slug} href={`/industries/${ind.slug}`}
              className="group bg-slate-900/60 border border-slate-800 rounded-2xl p-6
                         hover:border-slate-600 hover:bg-slate-900/80 hover:-translate-y-0.5
                         hover:shadow-xl hover:shadow-black/10 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradientColors[i % gradientColors.length]} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{ind.name}</h2>
                    <p className="text-sm text-slate-500">{tools.length} 个推荐工具</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">{ind.description}</p>
              <div className="flex gap-1.5 flex-wrap">
                {tools.slice(0, 5).map(t => (
                  <span key={t.id} className="tag">{t.name}</span>
                ))}
                {tools.length > 5 && (
                  <span className="text-xs text-slate-600">+{tools.length - 5} 更多</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
