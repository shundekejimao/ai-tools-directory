import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCombinationById } from '@/lib/data';

export default function CombinationDetailPage({ params }: any) {
  const combo = getCombinationById(params.id);
  if (!combo) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-slate-300">首页</Link>
        {' / '}
        <Link href="/combinations" className="hover:text-slate-300">搭配方案</Link>
        {' / '}
        <span className="text-slate-400">{combo.title}</span>
      </div>

      <h1 className="text-3xl font-bold text-slate-100 mb-4">{combo.title}</h1>
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-blue-400 mb-3">工具链</h2>
        <p className="text-slate-300 text-lg">{combo.tool_chain}</p>
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-200 mb-3">方案说明</h2>
        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{combo.description}</p>
      </div>

      {combo.body && (
        <div className="card mb-6">
          <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: combo.body }} />
        </div>
      )}

      <div className="text-sm text-slate-600">
        更新于：{combo.date_updated}
      </div>
    </div>
  );
}
