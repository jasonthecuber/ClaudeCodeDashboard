import { NextResponse } from 'next/server';
import { getUsageStats } from '@/lib/claude-usage';

export async function GET() {
  const stats = await getUsageStats();
  return NextResponse.json(stats);
}
