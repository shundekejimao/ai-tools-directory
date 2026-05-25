'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import ToolIcon from './ToolIcon';
import BadgeGroup from './BadgeGroup';
import { catNames } from '@/lib/constants';

interface Tool {
  id: string; slug: string; name: string; category: string;
  description_short?: string; tags: string[];
  pricing_tier: string; china_accessible: boolean;
  beginner_friendly: boolean; ecommerce_relevant: boolean;
  date_added: string; url?: string;
}

export default function ToolCard({ tool, index = 0, showMeta = true, variant = 'default' }: {
  tool: Tool;
  index?: number;
  showMeta?: boolean;
  variant?: 'default' | 'compact' | 'free';
}) {
  const router = useRouter();

  const cardClasses = `group bg-slate-900/60 border rounded-2xl transition-all duration-300
    hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/10
    ${variant === 'free'
      ? 'border-emerald-900/30 hover:border-emerald-700/50 hover:bg-slate-900/80 p-4'
      : variant === 'compact'
      ? 'border-slate-800 hover:border-slate-600 hover:bg-slate-900/80 p-4'
      : 'border-slate-800 hover:border-slate-600 hover:bg-slate-900/80 p-5'
    }`;

  const inner = (
    <div className={cardClasses}>
      {variant === 'free' ? (
        <div className="flex items-center gap-2.5 mb-2">
          <ToolIcon name={tool.name} size="sm" index={index} />
          <h3 className="font-medium text-sm text-white group-hover:text-emerald-400 transition-colors truncate">{tool.name}</h3>
        </div>
      ) : (
        <div className={`flex items-start gap-3 ${variant === 'compact' ? 'mb-2' : 'mb-3'}`}>
          <ToolIcon name={tool.name} size="md" index={index} />
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">{tool.name}</h2>
            {showMeta && (
              <p className="text-xs text-slate-500 mt-0.5">
                {catNames[tool.category] || tool.category}{variant === 'default' && tool.date_added ? ` · ${tool.date_added}` : ''}
              </p>
            )}
          </div>
          <BadgeGroup pricingTier={tool.pricing_tier} />
        </div>
      )}
      {variant !== 'free' && (
        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-3">{tool.description_short}</p>
      )}
      {variant !== 'free' && tool.url && (
        <a href={tool.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
           className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-1">
          <ExternalLink className="w-3 h-3" />
          官网
        </a>
      )}
      <div className={`flex gap-1.5 flex-wrap ${variant === 'free' ? '' : 'mt-3'}`}>
        {variant === 'free' ? (
          <>
            <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{catNames[tool.category] || tool.category}</span>
            {tool.ecommerce_relevant && <span className="badge-purple text-[10px]">电商</span>}
          </>
        ) : (
          <>
            {tool.tags.slice(0, 3).map(tag => (<span key={tag} className="tag">{tag}</span>))}
            {tool.china_accessible && <span className="badge-green text-[10px]">国内可用</span>}
            {tool.beginner_friendly && <span className="badge-blue text-[10px]">小白友好</span>}
            {tool.ecommerce_relevant && <span className="badge-purple text-[10px]">电商</span>}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div onClick={() => router.push(`/tools/${tool.slug}`)} className="cursor-pointer">
      {inner}
    </div>
  );
}
