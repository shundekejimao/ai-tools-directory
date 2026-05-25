import Link from 'next/link';
import { Link2, Clock, DollarSign, Package } from 'lucide-react';
import { getCombinations } from '@/lib/data';
import PageHeader from '@/components/PageHeader';

const emojis = ['⚡','🎯','💡','🔮','🚀','✨','🔥','💎'];

export default function CombinationsPage() {
  const combos = getCombinations();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader icon={Link2} title="最佳搭配方案" subtitle="多个 AI 工具组合使用，取长补短，效果翻倍" />

      {combos.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          <Package className="w-12 h-12 mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">搭配方案整理中，敬请期待。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {combos.map((combo, i) => (
            <Link key={combo.id} href={`/combinations/${combo.id}`}
              className="group bg-slate-900/60 border border-slate-800 rounded-2xl p-6
                         hover:border-amber-800/50 hover:bg-slate-900/80 hover:-translate-y-0.5
                         hover:shadow-xl hover:shadow-black/10 transition-all duration-300">
              <div className="flex gap-4 items-start">
                <span className="text-3xl">{emojis[i]}</span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors mb-2">{combo.title}</h2>
                  <p className="text-sm font-medium text-blue-400/80 mb-2">{combo.tool_chain}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{combo.description}</p>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {combo.time_saved && (
                      <span className="badge-blue"><Clock className="w-3 h-3" /> 省时：{combo.time_saved}</span>
                    )}
                    {combo.cost_summary && (
                      <span className="badge-green"><DollarSign className="w-3 h-3" /> {combo.cost_summary}</span>
                    )}
                    {combo.use_case && <span className="badge-purple">{combo.use_case}</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
