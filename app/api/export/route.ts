import { NextResponse } from 'next/server';
import { getSessionDetail, listSessions, listMemories } from '@/lib/claude-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'session' | 'sessions' | 'memory'
  const format = searchParams.get('format') || 'json'; // 'json' | 'markdown'
  const project = searchParams.get('project');
  const sessionId = searchParams.get('session');

  if (type === 'session' && project && sessionId) {
    const detail = await getSessionDetail(project, sessionId);
    if (!detail) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (format === 'markdown') {
      let md = `# Session: ${detail.projectName}\n`;
      md += `**ID:** ${detail.id}\n`;
      md += `**Started:** ${detail.startedAt}\n`;
      md += `**Messages:** ${detail.messageCount}\n\n---\n\n`;
      for (const msg of detail.messages) {
        md += `## ${msg.role.toUpperCase()}`;
        if (msg.timestamp) md += ` (${new Date(msg.timestamp).toLocaleString()})`;
        md += `\n\n${msg.content}\n\n---\n\n`;
      }
      return new Response(md, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="${detail.id}.md"`,
        },
      });
    }
    return NextResponse.json(detail);
  }

  if (type === 'sessions') {
    const sessions = await listSessions(project || undefined);
    return NextResponse.json(sessions);
  }

  if (type === 'memory') {
    const memories = await listMemories(project || undefined);
    if (format === 'markdown') {
      let md = '# Claude Code Memory Export\n\n';
      for (const m of memories) {
        md += `## ${m.name}\n**Type:** ${m.type}\n**Description:** ${m.description}\n\n${m.content}\n\n---\n\n`;
      }
      return new Response(md, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': 'attachment; filename="memory-export.md"',
        },
      });
    }
    return NextResponse.json(memories);
  }

  return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
}
