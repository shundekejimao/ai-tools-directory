import { NextRequest, NextResponse } from 'next/server';
import { getTools, searchTools, getToolsByCategory, getToolsByIndustry } from '@/lib/data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('search') || searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const industry = searchParams.get('industry') || '';
  const pricing = searchParams.get('pricing') || '';
  const china = searchParams.get('china') || '';
  const beginner = searchParams.get('beginner') || '';

  let tools = getTools();

  if (query) {
    tools = searchTools(query);
  }

  if (category) {
    tools = tools.filter(t => t.category === category);
  }

  if (industry) {
    const industryTools = getToolsByIndustry(industry);
    const ids = new Set(industryTools.map(t => t.id));
    tools = tools.filter(t => ids.has(t.id));
  }

  if (pricing) {
    tools = tools.filter(t => t.pricing_tier === pricing);
  }

  if (china === 'true') {
    tools = tools.filter(t => t.china_accessible);
  }

  if (beginner === 'true') {
    tools = tools.filter(t => t.beginner_friendly);
  }

  // Sort by date (newest first)
  tools.sort((a, b) => b.date_added.localeCompare(a.date_added));

  return NextResponse.json({ tools, total: tools.length });
}
