import { NextRequest, NextResponse } from 'next/server';
import { getCombinations } from '@/lib/data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const useCase = searchParams.get('use_case') || '';

  let combos = getCombinations();

  if (useCase) {
    combos = combos.filter(c => c.use_case === useCase);
  }

  return NextResponse.json({ combinations: combos, total: combos.length });
}
