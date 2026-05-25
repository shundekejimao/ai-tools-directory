import { NextRequest, NextResponse } from 'next/server';
import { verifyCozeKey } from '@/lib/auth';
import { upsertTool } from '@/lib/data';

export async function POST(request: NextRequest) {
  if (!verifyCozeKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.slug || !body.name) {
      return NextResponse.json({ error: 'slug and name are required' }, { status: 400 });
    }

    const tool = upsertTool(body);
    return NextResponse.json({ success: true, tool });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!verifyCozeKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ message: 'Use POST to upsert a tool. Body: { slug, name, description, ... }' });
}
