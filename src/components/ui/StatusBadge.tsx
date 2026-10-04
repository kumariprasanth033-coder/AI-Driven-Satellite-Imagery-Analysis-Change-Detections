import React from 'react';

export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'critical' | 'quantum';

interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  tone = 'neutral',
  size = 'sm',
  dot = true,
  className = ''
}) => {
  const toneMap: Record<StatusTone, { text: string; bg: string; border: string; dot: string }> = {
    neutral: {
      text: 'text-[var(--text-secondary)]',
      bg: 'bg-[var(--surface-secondary)]',
      border: 'border-[var(--border)]',
      dot: 'bg-[var(--text-muted)]'
    },
    info: {
      text: 'text-[var(--accent)]',
      bg: 'bg-[var(--accent-subtle)]',
      border: 'border-[var(--accent)]/30',
      dot: 'bg-[var(--accent)]'
    },
    success: {
      text: 'text-[var(--success)]',
      bg: 'bg-[var(--success-subtle)]',
      border: 'border-[var(--success)]/30',
      dot: 'bg-[var(--success)]'
    },
    warning: {
      text: 'text-[var(--warning)]',
      bg: 'bg-[var(--warning-subtle)]',
      border: 'border-[var(--warning)]/30',
      dot: 'bg-[var(--warning)]'
    },
    critical: {
      text: 'text-[var(--danger)]',
      bg: 'bg-[var(--danger-subtle)]',
      border: 'border-[var(--danger)]/30',
      dot: 'bg-[var(--danger)]'
    },
    quantum: {
      text: 'text-[var(--quantum)]',
      bg: 'bg-[var(--quantum-subtle)]',
      border: 'border-[var(--quantum)]/30',
      dot: 'bg-[var(--quantum)]'
    }
  };

  const current = toneMap[tone];
  const sizeClasses = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider rounded-[var(--radius-xs)] border ${current.bg} ${current.border} ${current.text} ${sizeClasses} font-medium ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${current.dot} shrink-0`} />}
      <span>{label}</span>
    </span>
  );
};
