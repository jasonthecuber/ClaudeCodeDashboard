import fs from 'fs/promises';
import path from 'path';
import { getClaudeHome } from './claude-home';

export interface PluginInfo {
  name: string;
  scope: string;
  installPath: string;
  installedAt: string;
  lastUpdated: string;
}

export interface ClaudeSettings {
  settings: Record<string, unknown>;
  mcp: Record<string, unknown>;
  plugins: PluginInfo[];
}

/**
 * Read Claude Code settings, MCP config, and installed plugins.
 */
export async function getClaudeSettings(): Promise<ClaudeSettings> {
  const claudeHome = getClaudeHome();

  const [settings, mcp, plugins] = await Promise.all([
    readJsonFile(path.join(claudeHome, 'settings.json')),
    readJsonFile(path.join(claudeHome, 'mcp.json')),
    readPlugins(path.join(claudeHome, 'plugins', 'installed_plugins.json')),
  ]);

  return { settings, mcp, plugins };
}

async function readJsonFile(filePath: string): Promise<Record<string, unknown>> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/**
 * Parse installed_plugins.json which has format:
 * {
 *   version: 2,
 *   plugins: {
 *     "name@source": [{ scope, installPath, installedAt, lastUpdated }]
 *   }
 * }
 */
async function readPlugins(filePath: string): Promise<PluginInfo[]> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content) as {
      version?: number;
      plugins?: Record<
        string,
        Array<{
          scope?: string;
          installPath?: string;
          installedAt?: string;
          lastUpdated?: string;
        }>
      >;
    };

    if (!data.plugins || typeof data.plugins !== 'object') {
      return [];
    }

    const plugins: PluginInfo[] = [];

    for (const [nameKey, entries] of Object.entries(data.plugins)) {
      if (!Array.isArray(entries)) continue;

      for (const entry of entries) {
        plugins.push({
          name: nameKey,
          scope: entry.scope || '',
          installPath: entry.installPath || '',
          installedAt: entry.installedAt || '',
          lastUpdated: entry.lastUpdated || '',
        });
      }
    }

    return plugins;
  } catch {
    return [];
  }
}
