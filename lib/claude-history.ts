import fs from 'fs/promises';
import path from 'path';
import { getClaudeHome } from './claude-home';

export interface HistoryEntry {
  display: string;
  timestamp: string; // ISO string converted from epoch ms
  project: string;
  projectName: string; // basename of project path
}

/**
 * Read and parse ~/.claude/history.jsonl, returning entries sorted newest-first.
 * Each line is JSON: {"display": "...", "timestamp": 1759067772820, "project": "/path/to/project"}
 */
export async function listHistory(limit?: number): Promise<HistoryEntry[]> {
  try {
    const historyPath = path.join(getClaudeHome(), 'history.jsonl');
    const content = await fs.readFile(historyPath, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);

    const entries: HistoryEntry[] = [];

    for (const line of lines) {
      try {
        const obj = JSON.parse(line) as {
          display?: string;
          timestamp?: number;
          project?: string;
        };

        if (!obj.display || !obj.timestamp || !obj.project) {
          continue;
        }

        entries.push({
          display: obj.display,
          timestamp: new Date(obj.timestamp).toISOString(),
          project: obj.project,
          projectName: path.basename(obj.project),
        });
      } catch {
        // Skip unparseable lines
      }
    }

    // Sort newest-first by timestamp
    entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (limit !== undefined && limit > 0) {
      return entries.slice(0, limit);
    }

    return entries;
  } catch {
    return [];
  }
}
