import fs from 'fs/promises';
import path from 'path';
import { getProjectsDir } from './claude-home';

export interface ToolUsageStat {
  tool: string;
  count: number;
  sessions: number; // how many unique sessions used this tool
}

export interface ToolAnalytics {
  tools: ToolUsageStat[];
  totalToolCalls: number;
  topTools: ToolUsageStat[]; // top 20
}

/**
 * Scan all project JSONL files and extract tool_use analytics from assistant messages.
 * In assistant entries, obj.message.content is an array. Blocks with type "tool_use"
 * have a "name" field for the tool name.
 */
export async function getToolAnalytics(): Promise<ToolAnalytics> {
  const toolCounts = new Map<string, number>();
  const toolSessions = new Map<string, Set<string>>();
  let totalToolCalls = 0;

  try {
    const projectsDir = getProjectsDir();
    const projectDirs = await fs.readdir(projectsDir, { withFileTypes: true });

    for (const projectDir of projectDirs) {
      if (!projectDir.isDirectory()) continue;

      const projectPath = path.join(projectsDir, projectDir.name);
      let sessionDirs: string[];

      try {
        const entries = await fs.readdir(projectPath);
        sessionDirs = entries;
      } catch {
        continue;
      }

      for (const sessionDir of sessionDirs) {
        const sessionPath = path.join(projectPath, sessionDir);

        let dirStat;
        try {
          dirStat = await fs.stat(sessionPath);
        } catch {
          continue;
        }
        if (!dirStat.isDirectory()) continue;

        let files: string[];
        try {
          files = await fs.readdir(sessionPath);
        } catch {
          continue;
        }

        for (const file of files) {
          if (!file.endsWith('.jsonl')) continue;

          const filePath = path.join(sessionPath, file);
          await processToolFile(filePath, sessionDir, toolCounts, toolSessions);
        }
      }
    }

    // Build sorted tool stats
    const tools: ToolUsageStat[] = Array.from(toolCounts.entries())
      .map(([tool, count]) => ({
        tool,
        count,
        sessions: toolSessions.get(tool)?.size || 0,
      }))
      .sort((a, b) => b.count - a.count);

    totalToolCalls = tools.reduce((sum, t) => sum + t.count, 0);

    return {
      tools,
      totalToolCalls,
      topTools: tools.slice(0, 20),
    };
  } catch {
    return {
      tools: [],
      totalToolCalls: 0,
      topTools: [],
    };
  }
}

async function processToolFile(
  filePath: string,
  sessionId: string,
  toolCounts: Map<string, number>,
  toolSessions: Map<string, Set<string>>
): Promise<void> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n').filter(Boolean);

    for (const line of lines) {
      try {
        const obj = JSON.parse(line);

        // Only process assistant messages with content array
        if (obj.message?.role !== 'assistant') continue;
        if (!Array.isArray(obj.message?.content)) continue;

        for (const block of obj.message.content) {
          if (block.type === 'tool_use' && block.name) {
            const toolName: string = block.name;

            toolCounts.set(toolName, (toolCounts.get(toolName) || 0) + 1);

            if (!toolSessions.has(toolName)) {
              toolSessions.set(toolName, new Set());
            }
            toolSessions.get(toolName)!.add(sessionId);
          }
        }
      } catch {
        // Skip unparseable lines (some can be very large)
      }
    }
  } catch {
    // Skip files that can't be read
  }
}
