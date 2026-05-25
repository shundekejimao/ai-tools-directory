import Link from 'next/link';
import { getCombinations } from '@/lib/data';

export default function CombinationsPage() {
  const combos = getCombinations();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-sm">🔗</span>
          <h1 className="text-3xl font-bold text-white">最佳搭配方案</h1>
        </div>
        <p className="text-slate-400">多个 AI 工具组合使用，取长补短，效果翻倍</p>
      </div>

      {combos.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          <span className="text-4xl block mb-3">🔮</span>
          搭配方案整理中，敬请期待。
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {combos.map((combo, i) => (
            <Link key={combo.id} href={`/combinations/${combo.id}`}
              className="group bg-slate-900/60 border border-slate-800 rounded-2xl p-6
                         hover:border-amber-800/50 hover:bg-slate-900/80 transition-all duration-300">
              <div className="flex gap-4 items-start">
                <span className="text-3xl">{['⚡','🎯','💡','🔮','🚀','✨','🔥','💎'][i]}</span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors mb-2">{combo.title}</h2>
                  <p className="text-sm font-medium text-blue-400/80 mb-2">{combo.tool_chain}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{combo.description}</p>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {combo.time_saved && <span className="badge-blue">⏱ 省时：{combo.time_saved}</span>}
                    {combo.cost_summary && <span className="badge-green">💰 {combo.cost_summary}</span>}
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
