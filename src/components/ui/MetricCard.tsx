import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  supportingText?: string;
  icon?: React.ReactNode;
  tone?: 'default' | 'blue' | 'purple' | 'cyan' | 'emerald' | 'amber' | 'rose';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  supportingText,
  icon,
  tone = 'default',
  className = ''
}) => {
  const valueColor = {
    default: 'text-[var(--text-primary)]',
    blue: 'text-[var(--accent-blue)]',
    purple: 'text-[var(--accent-quantum)]',
    cyan: 'text-[var(--accent-blue)]',
    emerald: 'text-[var(--accent-emerald)]',
    amber: 'text-[var(--accent-amber)]',
    rose: 'text-[var(--accent-rose)]'
  }[tone];

  return (
    <div
      className={`bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] rounded p-4 flex flex-col justify-between transition-all duration-150 shadow-xs ${className}`}
    >
      <div>
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2">
          <span className="font-mono uppercase tracking-wider text-[11px] text-[var(--text-secondary)]">
            {label}
          </span>
          {icon && <div className="text-[var(--text-muted)]">{icon}</div>}
        </div>

        <div className="flex items-baseline gap-1.5 mt-1">
          <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight ${valueColor}`}>
            {value}
          </span>
          {unit && (
            <span className="text-xs font-mono uppercase text-[var(--text-muted)]">
              {unit}
            </span>
          )}
        </div>
      </div>

      {supportingText && (
        <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] font-sans leading-relaxed">
          {supportingText}
        </div>
      )}
    </div>
  );
};
