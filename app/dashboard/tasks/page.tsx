'use client';

import { useEffect, useState } from 'react';

interface TaskEntry {
  id: string;
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

function truncateUuid(id: string): string {
  return id.length > 12 ? id.slice(0, 8) + '...' + id.slice(-4) : id;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tasks')
      .then(r => r.json())
      .then(setTasks)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400 animate-pulse">Loading...</p>;

  return (
    <div>
      <h2 className="font-heading text-2xl text-brand-cyan mb-6">Tasks</h2>

      {tasks.length === 0 ? (
        <p className="text-gray-500 text-sm">No tasks found.</p>
      ) : (
        <>
          <p className="text-gray-400 text-sm mb-4">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {tasks.map(task => (
              <div
                key={task.id}
                className="p-4 bg-brand-navy-light/50 border border-brand-navy-light/30 rounded-lg hover:border-brand-cyan/20 transition-colors"
              >
                <p className="text-white text-sm font-mono" title={task.id}>
                  {truncateUuid(task.id)}
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  {formatRelativeTime(task.lastModified)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
