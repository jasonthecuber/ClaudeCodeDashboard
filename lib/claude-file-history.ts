import fs from 'fs/promises';
import path from 'path';
import { getClaudeHome } from './claude-home';

export interface FileHistorySession {
  sessionId: string;
  fileCount: number;
  versionCount: number;
  lastModified: string;
}

/**
 * List sessions that have file history backups in ~/.claude/file-history/.
 * Each subdirectory is a session UUID containing files named like hash@v1, hash@v2.
 * Returns sorted by lastModified descending.
 */
export async function listFileHistorySessions(): Promise<FileHistorySession[]> {
  try {
    const fileHistoryDir = path.join(getClaudeHome(), 'file-history');
    const entries = await fs.readdir(fileHistoryDir, { withFileTypes: true });

    const sessions: FileHistorySession[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      try {
        const sessionPath = path.join(fileHistoryDir, entry.name);
        const files = await fs.readdir(sessionPath);
        const stat = await fs.stat(sessionPath);

        // Count unique file hashes (part before @) and total versions
        const uniqueHashes = new Set<string>();
        let versionCount = 0;

        for (const file of files) {
          const atIndex = file.lastIndexOf('@');
          if (atIndex > 0) {
            uniqueHashes.add(file.substring(0, atIndex));
            versionCount++;
          } else {
            // Files without @ pattern still count
            uniqueHashes.add(file);
            versionCount++;
          }
        }

        sessions.push({
          sessionId: entry.name,
          fileCount: uniqueHashes.size,
          versionCount,
          lastModified: stat.mtime.toISOString(),
        });
      } catch {
        // Skip sessions we can't read
      }
    }

    // Sort by lastModified descending (newest first)
    sessions.sort(
      (a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );

    return sessions;
  } catch {
    return [];
  }
}
