import { NextRequest, NextResponse } from 'next/server';
import { upsertTool, deleteTool, getTools } from '@/lib/data';

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get('admin_token')?.value;
  return token === (process.env.ADMIN_PASSWORD || 'admin123');
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ tools: getTools() });
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    if (!body.slug || !body.name) {
      return NextResponse.json({ error: 'slug and name required' }, { status: 400 });
    }
    const tool = upsertTool(body);
    return NextResponse.json({ success: true, tool });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });
  const ok = deleteTool(slug);
  return NextResponse.json({ success: ok });
}
