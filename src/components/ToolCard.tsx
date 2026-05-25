'use client';

import { useRouter } from 'next/navigation';
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

const baseCard = 'group bg-white/[0.02] border rounded-2xl transition-all duration-300 hover:-translate-y-0.5';
const baseHover = 'hover:border-white/[0.1] hover:bg-white/[0.04]';

export default function ToolCard({ tool, index = 0, showMeta = true, variant = 'default' }: {
  tool: Tool;
  index?: number;
  showMeta?: boolean;
  variant?: 'default' | 'compact' | 'free';
}) {
  const router = useRouter();

  const borderClass = variant === 'free'
    ? 'border-emerald-500/10 hover:border-emerald-500/25'
    : 'border-white/[0.04]';

  const inner = (
    <div className={`${baseCard} ${borderClass} ${baseHover} ${variant === 'free' ? 'p-4' : 'p-5'}`}>
      {variant === 'free' ? (
        <div className="flex items-center gap-2.5 mb-2">
          <ToolIcon name={tool.name} size="sm" index={index} />
          <h3 className="font-medium text-sm text-white group-hover:text-emerald-400 transition-colors truncate">{tool.name}</h3>
        </div>
      ) : (
        <div className={`flex items-start gap-3 ${variant === 'compact' ? 'mb-2' : 'mb-3'}`}>
          <ToolIcon name={tool.name} size="md" index={index} />
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-white text-[15px] group-hover:text-blue-400 transition-colors truncate">{tool.name}</h2>
            {showMeta && (
              <p className="text-xs text-zinc-500 mt-0.5">
                {catNames[tool.category] || tool.category}{variant === 'default' && tool.date_added ? ` · ${tool.date_added}` : ''}
              </p>
            )}
          </div>
          <BadgeGroup pricingTier={tool.pricing_tier} />
        </div>
      )}
      {variant !== 'free' && (
        <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed mb-3">{tool.description_short}</p>
      )}
      {variant !== 'free' && tool.url && (
        <a href={tool.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
           className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors mt-1">
          <ExternalLink className="w-3 h-3" />
          官网
        </a>
      )}
      <div className={`flex gap-1.5 flex-wrap ${variant === 'free' ? '' : 'mt-3'}`}>
        {variant === 'free' ? (
          <>
            <span className="text-[10px] text-zinc-500 bg-white/[0.03] px-1.5 py-0.5 rounded">{catNames[tool.category] || tool.category}</span>
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
