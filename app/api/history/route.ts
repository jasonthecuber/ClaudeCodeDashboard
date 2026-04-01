import { NextResponse } from 'next/server';
import { listHistory } from '@/lib/claude-history';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 200;
  const history = await listHistory(limit);
  return NextResponse.json(history);
}
