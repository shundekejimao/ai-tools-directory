import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getIndustryBySlug, getToolsByIndustry, getIndustries } from '@/lib/data';

export async function generateStaticParams() {
  return getIndustries().map(i => ({ slug: i.slug }));
}

const industryIcons: Record<string, string> = {
  ecommerce: '🛒', content: '✍️', programming: '💻', design: '🎨',
  office: '📊', 'audio-video': '🎬', 'ai-models': '🧠', 'local-offline': '📦',
};

const gradientColors = [
  'from-blue-500 to-cyan-500', 'from-violet-500 to-purple-500',
  'from-emerald-500 to-teal-500', 'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500', 'from-sky-500 to-indigo-500',
];

const catNames: Record<string, string> = {
  browser: '浏览器', image: '图像', code: '编程', voice: '语音',
  video: '视频', model: '大模型', office: '办公', ecommerce: '电商',
  design: '设计', other: '其他',
};

const priceLabel: Record<string, string> = {
  completely_free: '免费', open_source: '开源',
  freemium: '部分免费', paid: '付费',
};

export default function IndustryDetailPage({ params }: any) {
  const industry = getIndustryBySlug(params.slug);
  if (!industry) notFound();

  const tools = getToolsByIndustry(params.slug);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-slate-300 transition-colors">首页</Link>
        <span>/</span>
        <Link href="/industries" className="hover:text-slate-300 transition-colors">行业分类</Link>
        <span>/</span>
        <span className="text-slate-300">{industry.name}</span>
      </nav>

      <div className="flex items-center gap-4 mb-8">
        <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-3xl">
          {industryIcons[industry.slug] || '📌'}
        </span>
        <div>
          <h1 className="text-3xl font-bold text-white">{industry.name}</h1>
          <p className="text-slate-400 mt-1">{industry.description} · 推荐 {tools.length} 个 AI 工具</p>
        </div>
      </div>

      {tools.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          <span className="text-4xl block mb-3">📦</span>
          该行业暂无推荐工具，我们会持续更新。
        </div>
      ) : (
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
