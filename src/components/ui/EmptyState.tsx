import React from 'react';
import { Database, Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon
}) => {
  return (
    <div className="p-10 flex flex-col items-center justify-center text-center bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] shadow-xs">
      <div className="w-10 h-10 rounded-[var(--radius-xs)] bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] mb-3">
        {icon || <Database className="w-5 h-5" />}
      </div>
      <h3 className="font-['Syne'] font-bold text-sm text-[var(--text-primary)]">{title}</h3>
      <p className="text-[11px] text-[var(--text-secondary)] mt-1 max-w-sm leading-relaxed font-sans">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-3.5 geo-btn-primary"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
