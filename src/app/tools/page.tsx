'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wrench } from 'lucide-react';
import { catNames, priceLabel } from '@/lib/constants';
import PageHeader from '@/components/PageHeader';
import ToolIcon from '@/components/ToolIcon';
import BadgeGroup from '@/components/BadgeGroup';

const BASE_PATH = '/ai-tools-directory';

const gradientColors = [
  'from-blue-500 to-cyan-500', 'from-violet-500 to-purple-500',
  'from-emerald-500 to-teal-500', 'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500', 'from-sky-500 to-indigo-500',
];

const catIcons: Record<string, string> = {
  browser: '🌐', image: '🖼️', code: '💻', voice: '🎙️',
  video: '🎬', model: '🧠', office: '📊', ecommerce: '🛒',
  design: '🎨', other: '📦',
};

interface Tool {
  id: string; slug: string; name: string; category: string;
  description_short?: string; tags: string[];
  pricing_tier: string; china_accessible: boolean;
  beginner_friendly: boolean; ecommerce_relevant: boolean;
  date_added: string; url?: string;
}

export default function ToolsPage() {
  const router = useRouter();
  const [tools, setTools] = useState<Tool[]>([]);
  const [activeCat, setActiveCat] = useState('全部');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_PATH}/data/tools.json`).then(r => r.json()).then((data: Tool[]) => {
      data.sort((a, b) => b.date_added.localeCompare(a.date_added));
      setTools(data);
      setLoading(false);
    });
  }, []);

  const categories = ['全部', ...new Set(tools.map(t => t.category))].sort((a,b) => a==='全部'?-1:b==='全部'?1:0);
  const filtered = activeCat === '全部' ? tools : tools.filter(t => t.category === activeCat);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-fade-in">
          <PageHeader icon={Wrench} title="全部AI工具" />
          <div className="flex gap-2 mb-8 flex-wrap">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton w-20 h-9 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="skeleton w-10 h-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-5 w-24" />
                    <div className="skeleton h-3 w-32" />
                  </div>
                </div>
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <PageHeader icon={Wrench} title="全部AI工具" subtitle={`共 ${filtered.length} 款 AI 工具`} />

      {/* Category filter tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCat(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeCat === cat
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'bg-slate-800 text-slate-400 border border-slate-700/50 hover:border-slate-600'
            }`}>
            {cat === '全部' ? cat : `${catIcons[cat] || ''} ${catNames[cat] || cat}`}
          </button>
        ))}
      </div>

      {/* Tool grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tool, i) => (
          <div key={tool.id} onClick={() => router.push(`/tools/${tool.slug}`)} className="cursor-pointer">
            <div className="group bg-slate-900/60 border border-slate-800 rounded-2xl p-5
                           hover:border-slate-600 hover:bg-slate-900/80 hover:-translate-y-0.5
                           hover:shadow-xl hover:shadow-black/10 transition-all duration-300">
              <div className="flex items-start gap-3 mb-3">
                <ToolIcon name={tool.name} index={i} />
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">{tool.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{catNames[tool.category] || tool.category} · {tool.date_added}</p>
                </div>
                <BadgeGroup pricingTier={tool.pricing_tier} />
              </div>
              <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-3">{tool.description_short}</p>
              {tool.url && (
                <a href={tool.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                   className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  官网
                </a>
              )}
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {tool.tags.slice(0, 3).map(tag => (<span key={tag} className="tag">{tag}</span>))}
                {tool.china_accessible && <span className="badge-green text-[10px]">国内可用</span>}
                {tool.beginner_friendly && <span className="badge-blue text-[10px]">小白友好</span>}
                {tool.ecommerce_relevant && <span className="badge-purple text-[10px]">电商</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
