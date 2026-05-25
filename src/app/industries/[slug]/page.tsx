import { notFound } from 'next/navigation';
import { Package, ShoppingCart, PenLine, Code2, Palette, Briefcase, Video, Brain } from 'lucide-react';
import { getIndustryBySlug, getToolsByIndustry, getIndustries } from '@/lib/data';
import Breadcrumb from '@/components/Breadcrumb';
import ToolCard from '@/components/ToolCard';

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
    <div className="page-container py-8">
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
          <p className="text-zinc-400 mt-1">{industry.description} · 推荐 {tools.length} 个 AI 工具</p>
        </div>
      </div>

      {tools.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-12 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
          <p className="text-zinc-400">该行业暂无推荐工具，我们会持续更新。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
