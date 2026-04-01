import { NextResponse } from 'next/server';
import { listFileHistorySessions } from '@/lib/claude-file-history';

export async function GET() {
  const sessions = await listFileHistorySessions();
  return NextResponse.json(sessions);
}
