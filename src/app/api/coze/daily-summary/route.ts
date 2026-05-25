import { NextRequest, NextResponse } from 'next/server';
import { verifyCozeKey } from '@/lib/auth';
import { getDailySummary } from '@/lib/data';

export async function GET(request: NextRequest) {
  if (!verifyCozeKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const summary = getDailySummary();
  return NextResponse.json(summary);
}
