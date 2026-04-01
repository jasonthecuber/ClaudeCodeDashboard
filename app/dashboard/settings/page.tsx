'use client';

import { useEffect, useState } from 'react';

interface ClaudeSettings {
  settings: Record<string, unknown>;
  mcp: Record<string, unknown>;
  plugins: Array<{
    name: string;
    scope: string;
    installPath: string;
    installedAt: string;
    lastUpdated: string;
  }>;
}

type Tab = 'settings' | 'mcp' | 'plugins';

export default function SettingsPage() {
  const [data, setData] = useState<ClaudeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('settings');

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400 animate-pulse">Loading...</p>;
  if (!data) return <p className="text-gray-500 text-sm">Failed to load settings.</p>;

  const tabs: Tab[] = ['settings', 'mcp', 'plugins'];

  return (
    <div>
      <h2 className="font-heading text-2xl text-brand-cyan mb-6">Settings Inspector</h2>

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors capitalize ${
              activeTab === tab
                ? 'bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan'
                : 'border-brand-navy-light/30 text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-brand-navy-light/50 border border-brand-navy-light/30 rounded-lg p-4">
          <pre className="text-sm text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(data.settings, null, 2)}
          </pre>
        </div>
      )}

      {/* MCP Tab */}
      {activeTab === 'mcp' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(data.mcp).length === 0 && (
            <p className="text-gray-500 text-sm col-span-2">No MCP servers configured.</p>
          )}
          {Object.entries(data.mcp).map(([name, config]) => {
            const cfg = config as Record<string, unknown>;
            return (
              <div
                key={name}
                className="p-4 bg-brand-navy-light/50 border border-brand-navy-light/30 rounded-lg hover:border-brand-cyan/20 transition-colors"
              >
                <p className="text-brand-cyan text-sm font-medium mb-3">{name}</p>
                {cfg.command != null && (
                  <div className="mb-2">
                    <p className="text-gray-500 text-xs">Command</p>
                    <p className="text-white text-sm font-mono">{String(cfg.command)}</p>
                  </div>
                )}
                {Array.isArray(cfg.args) && (
                  <div className="mb-2">
                    <p className="text-gray-500 text-xs">Args</p>
                    <p className="text-gray-300 text-xs font-mono break-all">
                      {(cfg.args as string[]).join(' ')}
                    </p>
                  </div>
                )}
                {cfg.env != null && typeof cfg.env === 'object' && (
                  <div>
                    <p className="text-gray-500 text-xs">Environment</p>
                    <div className="mt-1 space-y-0.5">
                      {Object.entries(cfg.env as Record<string, string>).map(([k, v]) => (
                        <p key={k} className="text-xs font-mono">
                          <span className="text-chameleon-amber">{k}</span>
                          <span className="text-gray-500">=</span>
                          <span className="text-gray-400">{typeof v === 'string' && v.length > 20 ? v.slice(0, 20) + '...' : String(v)}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Plugins Tab */}
      {activeTab === 'plugins' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.plugins.length === 0 && (
            <p className="text-gray-500 text-sm col-span-2">No plugins installed.</p>
          )}
          {data.plugins.map(plugin => (
            <div
              key={plugin.name}
              className="p-4 bg-brand-navy-light/50 border border-brand-navy-light/30 rounded-lg hover:border-brand-cyan/20 transition-colors"
            >
              <p className="text-white text-sm font-medium">{plugin.name}</p>
              <div className="mt-2 space-y-1 text-xs">
                <p className="text-gray-400">Scope: <span className="text-chameleon-purple">{plugin.scope}</span></p>
                <p className="text-gray-400">Installed: <span className="text-gray-300">{new Date(plugin.installedAt).toLocaleDateString()}</span></p>
                <p className="text-gray-400">Updated: <span className="text-gray-300">{new Date(plugin.lastUpdated).toLocaleDateString()}</span></p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
