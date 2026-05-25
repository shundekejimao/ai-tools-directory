import { NextRequest, NextResponse } from 'next/server';
import { searchTools } from '@/lib/data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (!q) {
    return NextResponse.json({ results: [], total: 0 });
  }

  const results = searchTools(q);

  return NextResponse.json({
    results: results.map(t => ({
      id: t.id, slug: t.slug, name: t.name,
      category: t.category, description_short: t.description_short,
      pricing_tier: t.pricing_tier, china_accessible: t.china_accessible,
      tags: t.tags, date_updated: t.date_updated,
    })),
    total: results.length,
  });
}
