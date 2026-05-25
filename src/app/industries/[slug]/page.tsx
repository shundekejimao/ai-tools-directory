import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getIndustryBySlug, getToolsByIndustry, getIndustries } from '@/lib/data';

export async function generateStaticParams() {
  return getIndustries().map(i => ({ slug: i.slug }));
}

export default function IndustryDetailPage({ params }: any) {
  const industry = getIndustryBySlug(params.slug);
  if (!industry) notFound();

  const tools = getToolsByIndustry(params.slug);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-sm text-slate-500 mb-4">
        <Link href="/" className="hover:text-slate-300">首页</Link>
        {' / '}
        <Link href="/industries" className="hover:text-slate-300">行业分类</Link>
        {' / '}
        <span className="text-slate-400">{industry.name}</span>
      </div>

      <h1 className="text-3xl font-bold text-slate-100 mb-2">{industry.name}</h1>
      <p className="text-slate-400 mb-8">{industry.description}</p>

      {tools.length === 0 ? (
        <div className="card text-center text-slate-500 py-12">
          该行业暂无推荐工具，我们会持续更新。
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map(tool => (
            <Link key={tool.id} href={`/tools/${tool.slug}`} className="card group">
              <h2 className="font-medium text-slate-200 group-hover:text-blue-400 transition-colors">{tool.name}</h2>
              <p className="text-sm text-slate-400 mt-1 line-clamp-2">{tool.description_short}</p>
              <div className="flex gap-1.5 mt-3">
                <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded">{tool.category}</span>
                {tool.china_accessible && (
                  <span className="badge-green text-xs">国内可用</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
