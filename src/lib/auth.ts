import { NextRequest } from 'next/server';

export function verifyCozeKey(request: NextRequest): boolean {
  const auth = request.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  const expected = process.env.COZE_API_KEY || 'coze-daily-update-key-change-me';
  return token === expected && token.length >= 8;
}

export function verifyAdmin(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || 'admin123';
  return password === expected && password.length >= 4;
}
