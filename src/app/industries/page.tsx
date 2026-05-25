import Link from 'next/link';
import { getIndustries, getToolsByIndustry } from '@/lib/data';

const industryIcons: Record<string, string> = {
  ecommerce: '🛒', content: '✍️', programming: '💻', design: '🎨',
  office: '📊', 'audio-video': '🎬', 'ai-models': '🧠', 'local-offline': '📦',
};

const gradientColors = [
  'from-blue-500 to-cyan-500', 'from-violet-500 to-purple-500',
  'from-emerald-500 to-teal-500', 'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500', 'from-sky-500 to-indigo-500',
  'from-lime-500 to-green-500', 'from-fuchsia-500 to-rose-500',
];

export default function IndustriesPage() {
  const industries = getIndustries();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-sm">🏭</span>
          <h1 className="text-3xl font-bold text-white">行业分类</h1>
        </div>
        <p className="text-slate-400">按行业场景查找最适合的AI工具组合</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {industries.map((ind, i) => {
          const tools = getToolsByIndustry(ind.slug);
          return (
            <Link key={ind.slug} href={`/industries/${ind.slug}`}
              className="group bg-slate-900/60 border border-slate-800 rounded-2xl p-6
                         hover:border-slate-600 hover:bg-slate-900/80 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradientColors[i % gradientColors.length]} flex items-center justify-center text-2xl`}>
                    {industryIcons[ind.slug] || '📌'}
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
