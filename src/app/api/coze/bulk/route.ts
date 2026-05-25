import { NextRequest, NextResponse } from 'next/server';
import { verifyCozeKey } from '@/lib/auth';
import { bulkUpsertTools } from '@/lib/data';

export async function POST(request: NextRequest) {
  if (!verifyCozeKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!Array.isArray(body.tools)) {
      return NextResponse.json({ error: 'tools array is required' }, { status: 400 });
    }

    const results = bulkUpsertTools(body.tools);
    return NextResponse.json({ success: true, count: results.length, tools: results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
