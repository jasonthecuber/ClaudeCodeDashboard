import { NextResponse } from 'next/server';
import { getToolAnalytics } from '@/lib/claude-tools';

export async function GET() {
  const analytics = await getToolAnalytics();
  return NextResponse.json(analytics);
}
