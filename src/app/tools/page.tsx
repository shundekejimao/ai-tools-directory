'use client';

import { useEffect, useState } from 'react';
import { Wrench } from 'lucide-react';
import { catNames } from '@/lib/constants';
import PageHeader from '@/components/PageHeader';
import ToolCard from '@/components/ToolCard';

const BASE_PATH = '/ai-tools-directory';

interface Tool {
  id: string; slug: string; name: string; category: string;
  description_short?: string; tags: string[];
  pricing_tier: string; china_accessible: boolean;
  beginner_friendly: boolean; ecommerce_relevant: boolean;
  date_added: string; url?: string;
}

export default function ToolsPage() {
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
      <div className="page-container py-8 animate-fade-in">
        <PageHeader icon={Wrench} title="全部AI工具" />
        <div className="flex gap-2 mb-8 flex-wrap">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton w-20 h-9 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-5 space-y-3">
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
    );
  }

  return (
    <div className="page-container py-8 animate-fade-in">
      <PageHeader icon={Wrench} title="全部AI工具" subtitle={`共 ${filtered.length} 款 AI 工具`} />

      <div className="flex gap-2 mb-8 flex-wrap">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCat(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeCat === cat
                ? 'bg-white text-black shadow-lg shadow-white/5'
                : 'bg-white/[0.04] text-zinc-400 border border-white/[0.06] hover:border-white/[0.12] hover:text-zinc-200'
            }`}>
            {cat === '全部' ? cat : `${catNames[cat] || cat}`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tool, i) => (
          <ToolCard key={tool.id} tool={tool} index={i} />
        ))}
      </div>
    </div>
  );
}
