import { NextRequest, NextResponse } from 'next/server';
import { getChangelog } from '@/lib/data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '7');

  const entries = getChangelog(days);
  return NextResponse.json({ entries, total: entries.length });
}
