import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ListChecks, ArrowLeft } from 'lucide-react';
import { getCombinationById, getCombinations } from '@/lib/data';
import Breadcrumb from '@/components/Breadcrumb';

export async function generateStaticParams() {
  return getCombinations().map(c => ({ id: c.id }));
}

export default function CombinationDetailPage({ params }: any) {
  const combo = getCombinationById(params.id);
  if (!combo) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb items={[
        { label: '首页', href: '/' },
        { label: '搭配方案', href: '/combinations' },
        { label: combo.title },
      ]} />

      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">{combo.title}</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          {combo.use_case && <span className="badge-purple text-sm px-3 py-1">{combo.use_case}</span>}
          {combo.time_saved && <span className="badge-blue text-sm px-3 py-1">⏱ {combo.time_saved}</span>}
          {combo.cost_summary && <span className="badge-green text-sm px-3 py-1">💰 {combo.cost_summary}</span>}
        </div>
        <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">工具链</h2>
          <p className="text-slate-200 text-lg font-medium">{combo.tool_chain}</p>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 mb-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
          <span className="icon-wrap-sm bg-blue-500/20 text-blue-400"><ListChecks className="w-3.5 h-3.5" /></span>
          方案说明
        </h2>
        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{combo.description}</p>
      </div>

      {combo.body && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 mb-8">
          <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: combo.body }} />
        </div>
      )}

      <div className="text-center">
        <Link href="/combinations" className="btn-ghost text-sm">
          <ArrowLeft className="w-3.5 h-3.5" />
          返回搭配方案列表
        </Link>
      </div>
    </div>
  );
}
