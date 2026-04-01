import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getClaudeHome, getProjectsDir } from '@/lib/claude-home';

// List all CLAUDE.md files (global + per-project)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const project = searchParams.get('project');

  if (project) {
    // Read specific project's CLAUDE.md
    // The project's CLAUDE.md is at the actual project path, not in ~/.claude
    // But we also have project-level CLAUDE.md in the claude projects dir
    const claudeProjectDir = path.join(getProjectsDir(), project);
    const claudeMdPath = path.join(claudeProjectDir, 'CLAUDE.md');
    try {
      const content = await fs.readFile(claudeMdPath, 'utf-8');
      return NextResponse.json({ path: claudeMdPath, content, project });
    } catch {
      return NextResponse.json({ path: claudeMdPath, content: null, project });
    }
  }

  // List all CLAUDE.md files: global + per-project
  const results: Array<{ project: string | null; path: string; content: string }> = [];

  // Global CLAUDE.md
  const globalPath = path.join(getClaudeHome(), 'CLAUDE.md');
  try {
    const content = await fs.readFile(globalPath, 'utf-8');
    results.push({ project: null, path: globalPath, content });
  } catch { /* doesn't exist */ }

  // Per-project CLAUDE.md files
  const projectsDir = getProjectsDir();
  try {
    const entries = await fs.readdir(projectsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const claudeMdPath = path.join(projectsDir, entry.name, 'CLAUDE.md');
      try {
        const content = await fs.readFile(claudeMdPath, 'utf-8');
        results.push({ project: entry.name, path: claudeMdPath, content });
      } catch { /* no CLAUDE.md */ }
    }
  } catch { /* projects dir doesn't exist */ }

  return NextResponse.json(results);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { path: filePath, content } = body;

  if (!filePath || typeof content !== 'string') {
    return NextResponse.json({ error: 'Missing path or content' }, { status: 400 });
  }

  // Safety: only allow writing to .claude directory
  const claudeHome = getClaudeHome();
  if (!filePath.startsWith(claudeHome)) {
    return NextResponse.json({ error: 'Path must be within Claude home directory' }, { status: 403 });
  }

  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
