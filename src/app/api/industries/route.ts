import { NextResponse } from 'next/server';
import { getIndustries, getToolsByIndustry } from '@/lib/data';

export async function GET() {
  const industries = getIndustries().map(ind => {
    const tools = getToolsByIndustry(ind.slug);
    return {
      ...ind,
      tool_count: tools.length,
      tools: tools.map(t => ({
        id: t.id, slug: t.slug, name: t.name,
        category: t.category, description_short: t.description_short,
        pricing_tier: t.pricing_tier,
      })),
    };
  });

  return NextResponse.json({ industries });
}
