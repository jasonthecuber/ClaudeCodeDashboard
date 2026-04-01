import fs from 'fs/promises';
import path from 'path';
import { getClaudeHome } from './claude-home';

export interface TaskEntry {
  id: string;
  lastModified: string;
}

/**
 * List task directories in ~/.claude/tasks/.
 * Each directory is a UUID. Returns sorted by lastModified descending.
 */
export async function listTasks(): Promise<TaskEntry[]> {
  try {
    const tasksDir = path.join(getClaudeHome(), 'tasks');
    const entries = await fs.readdir(tasksDir, { withFileTypes: true });

    const tasks: TaskEntry[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      try {
        const dirPath = path.join(tasksDir, entry.name);
        const stat = await fs.stat(dirPath);

        tasks.push({
          id: entry.name,
          lastModified: stat.mtime.toISOString(),
        });
      } catch {
        // Skip dirs we can't stat
      }
    }

    // Sort by lastModified descending (newest first)
    tasks.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

    return tasks;
  } catch {
    return [];
  }
}
