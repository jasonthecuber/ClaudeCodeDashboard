'use client';

import { useEffect, useState } from 'react';

interface FileHistorySession {
  sessionId: string;
  fileCount: number;
  versionCount: number;
  lastModified: string;
}

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return new Date(timestamp).toLocaleDateString();
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

function truncateId(id: string): string {
  return id.length > 16 ? id.slice(0, 8) + '...' + id.slice(-4) : id;
}

export default function FileHistoryPage() {
  const [sessions, setSessions] = useState<FileHistorySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/file-history')
      .then(r => r.json())
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400 animate-pulse">Loading...</p>;

  return (
    <div>
      <h2 className="font-heading text-2xl text-brand-cyan mb-6">File History</h2>

      {sessions.length === 0 ? (
        <p className="text-gray-500 text-sm">No file history sessions found.</p>
      ) : (
        <>
          <p className="text-gray-400 text-sm mb-4">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} with file backups
          </p>
          <div className="space-y-2">
            {sessions.map(session => (
              <div
                key={session.sessionId}
                className="p-4 bg-brand-navy-light/50 border border-brand-navy-light/30 rounded-lg hover:border-brand-cyan/20 transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-white text-sm font-mono" title={session.sessionId}>
                    {truncateId(session.sessionId)}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {formatRelativeTime(session.lastModified)}
                  </p>
                </div>
                <div className="flex gap-6 text-right">
                  <div>
                    <p className="text-white text-sm">{session.fileCount}</p>
                    <p className="text-gray-500 text-xs">files</p>
                  </div>
                  <div>
                    <p className="text-white text-sm">{session.versionCount}</p>
                    <p className="text-gray-500 text-xs">versions</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
