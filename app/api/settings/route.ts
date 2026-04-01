import { NextResponse } from 'next/server';
import { getClaudeSettings } from '@/lib/claude-settings';

export async function GET() {
  const settings = await getClaudeSettings();
  return NextResponse.json(settings);
}
