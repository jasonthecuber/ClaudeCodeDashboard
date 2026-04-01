'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Markdown from '@/components/ui/markdown';
import type { SessionDetail } from '@/types/claude';

const roleBadge: Record<string, string> = {
  user: 'bg-chameleon-blue/20 text-chameleon-blue',
  assistant: 'bg-brand-cyan/20 text-brand-cyan',
  system: 'bg-chameleon-amber/20 text-chameleon-amber',
};

export default function SessionDetailPage() {
  const params = useParams<{ project: string; id: string }>();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!params.project || !params.id) return;
    fetch(`/api/sessions/${params.project}/${params.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(setSession)
      .finally(() => setLoading(false));
  }, [params.project, params.id]);

  function toggleMessage(index: number) {
    setExpandedMessages(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  if (loading) {
    return <p className="text-gray-400 animate-pulse">Loading session...</p>;
  }

  if (!session) {
    return (
      <div>
        <Link href="/dashboard/sessions" className="text-brand-cyan text-sm hover:underline">
          &larr; Back to sessions
        </Link>
        <p className="text-red-400 mt-4">Session not found.</p>
      </div>
    );
  }

  return (
    <div>
      <Link href="/dashboard/sessions" className="text-brand-cyan text-sm hover:underline">
        &larr; Back to sessions
      </Link>

      <div className="mt-4 mb-6">
        <h2 className="font-heading text-2xl text-brand-cyan">{session.projectName}</h2>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <span>Session: {session.id.slice(0, 12)}...</span>
          <span>{session.messageCount} messages</span>
          <span>Started: {new Date(session.startedAt).toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-3">
        {session.messages.map((msg, i) => {
          const isLong = msg.content.length > 500;
          const isExpanded = expandedMessages.has(i);
          const displayContent = isLong && !isExpanded
            ? msg.content.slice(0, 500) + '...'
            : msg.content;

          return (
            <div
              key={i}
              className={`rounded-lg border transition-colors ${
                msg.role === 'user'
                  ? 'bg-brand-navy-light/30 border-chameleon-blue/10'
                  : msg.role === 'assistant'
                  ? 'bg-brand-navy-light/50 border-brand-cyan/10'
                  : 'bg-brand-navy-dark/50 border-chameleon-amber/10'
              }`}
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-brand-navy-light/20">
                <span className={`text-xs px-2 py-0.5 rounded-full ${roleBadge[msg.role]}`}>
                  {msg.role}
                </span>
                {msg.timestamp && (
                  <span className="text-xs text-gray-600">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>
              <div className="px-4 py-3">
                <Markdown content={displayContent} />
                {isLong && (
                  <button
                    onClick={() => toggleMessage(i)}
                    className="mt-2 text-xs text-brand-cyan hover:underline"
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {session.messages.length === 0 && (
          <p className="text-gray-500 text-sm">No messages in this session.</p>
        )}
      </div>
    </div>
  );
}
