import { NextRequest, NextResponse } from 'next/server';
import { getToolBySlug, getComplementaryTools, getCombinations } from '@/lib/data';

export async function GET(
  request: NextRequest,
  { params }: any
) {
  const tool = getToolBySlug(params.slug);
  if (!tool) {
    return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
  }

  const complementary = getComplementaryTools(params.slug);

  const allCombos = getCombinations();
  const relatedCombos = allCombos.filter(c =>
    c.tool_chain?.includes(tool.name) || tool.related_combinations.includes(c.id)
  );

  return NextResponse.json({
    tool,
    complementaryTools: complementary.map(t => ({
      id: t.id, slug: t.slug, name: t.name,
      category: t.category, description_short: t.description_short,
      pricing_tier: t.pricing_tier,
    })),
    relatedCombinations: relatedCombos,
  });
}
