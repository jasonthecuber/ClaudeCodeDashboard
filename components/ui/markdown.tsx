'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownProps {
  content: string;
  className?: string;
}

export default function Markdown({ content, className = '' }: MarkdownProps) {
  return (
    <div className={`prose prose-invert prose-sm max-w-none
      prose-headings:text-brand-cyan prose-headings:font-heading
      prose-a:text-brand-cyan-light prose-a:no-underline hover:prose-a:underline
      prose-code:text-chameleon-amber prose-code:bg-brand-navy-dark prose-code:px-1 prose-code:rounded
      prose-pre:bg-brand-navy-dark prose-pre:border prose-pre:border-brand-navy-light/30
      prose-strong:text-white
      prose-th:text-gray-300 prose-td:text-gray-400
      prose-hr:border-brand-navy-light/30
      ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
