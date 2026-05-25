import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    if (!verifyAdmin(password)) {
      return NextResponse.json({ error: '密码错误' }, { status: 401 });
    }
    const resp = NextResponse.json({ success: true });
    resp.cookies.set('admin_token', process.env.ADMIN_PASSWORD || 'admin123', {
      httpOnly: true, path: '/', maxAge: 60 * 60 * 24, sameSite: 'lax',
    });
    return resp;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  const valid = token === (process.env.ADMIN_PASSWORD || 'admin123');
  return NextResponse.json({ authenticated: valid });
}
