import Link from 'next/link';
import { getIndustries, getToolsByIndustry } from '@/lib/data';

export default function IndustriesPage() {
  const industries = getIndustries();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-200 mb-6">行业分类</h1>
      <p className="text-slate-400 mb-8">按行业场景查找最适合的AI工具</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {industries.map(ind => {
          const tools = getToolsByIndustry(ind.slug);
          return (
            <Link key={ind.slug} href={`/industries/${ind.slug}`} className="card group">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">{ind.name}</h2>
                <span className="text-sm text-slate-500">{tools.length} 个工具</span>
              </div>
              <p className="text-sm text-slate-400 mb-3">{ind.description}</p>
              <div className="flex gap-1 flex-wrap">
                {tools.slice(0, 5).map(t => (
                  <span key={t.id} className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded">{t.name}</span>
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
