import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subtext?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading remote sensing intelligence...',
  subtext = 'Querying calibrated multi-spectral indices and statevector simulation cache.',
  className = ''
}) => {
  return (
    <div
      className={`p-10 flex flex-col items-center justify-center text-center bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] shadow-xs ${className}`}
    >
      <div className="w-9 h-9 rounded-full bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] mb-3">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
      <h4 className="text-xs font-semibold text-[var(--text-primary)] font-mono">{message}</h4>
      {subtext && (
        <p className="text-[11px] text-[var(--text-secondary)] mt-1 max-w-md font-sans leading-relaxed">
          {subtext}
        </p>
      )}
    </div>
  );
};
