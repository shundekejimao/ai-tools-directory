import Link from 'next/link';
import { getCombinations } from '@/lib/data';

export default function CombinationsPage() {
  const combos = getCombinations();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-200 mb-2">最佳搭配方案</h1>
      <p className="text-slate-400 mb-8">多个AI工具组合使用，取长补短，效果翻倍</p>

      {combos.length === 0 ? (
        <div className="card text-center text-slate-500 py-12">搭配方案整理中，敬请期待。</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {combos.map(combo => (
            <Link key={combo.id} href={`/combinations/${combo.id}`} className="card group">
              <h2 className="text-lg font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">{combo.title}</h2>
              <p className="text-sm text-slate-400 mt-2 mb-3">{combo.tool_chain}</p>
              <p className="text-sm text-slate-300">{combo.description}</p>
              <div className="flex gap-3 mt-3 text-xs">
                {combo.time_saved && (
                  <span className="text-blue-400">省时：{combo.time_saved}</span>
                )}
                {combo.cost_summary && (
                  <span className="text-green-400">{combo.cost_summary}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
