'use client';

interface ExportButtonProps {
  url: string;
  label?: string;
}

export default function ExportButton({ url, label = 'Export' }: ExportButtonProps) {
  function handleExport() {
    window.open(url, '_blank');
  }

  return (
    <button
      onClick={handleExport}
      className="px-3 py-1.5 text-xs rounded-lg border border-brand-navy-light/30 text-gray-400 hover:text-brand-cyan hover:border-brand-cyan/30 transition-colors"
    >
      {label}
    </button>
  );
}
