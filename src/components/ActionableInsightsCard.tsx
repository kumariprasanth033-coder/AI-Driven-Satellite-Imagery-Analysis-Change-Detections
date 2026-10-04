import React from 'react';
import { Compass, AlertTriangle, ShieldCheck, Clock, Info, CheckCircle2 } from 'lucide-react';
import { PriorityLevel } from '../types/analysis';
import { StatusBadge } from './ui/StatusBadge';

interface Props {
  priority?: PriorityLevel;
  recommendedAction?: string;
  monitoring?: string;
  insight?: string;
  confidence?: number;
  affectedAreaKm2?: number;
  changeType?: string;
}

export const ActionableInsightsCard: React.FC<Props> = ({
  priority = 'high',
  recommendedAction = 'Field Inspection & Priority Satellite Monitoring',
  monitoring = 'Bi-weekly multi-spectral pass recommended to verify seasonal vegetation recovery vs structural loss.',
  insight = 'Multi-spectral infrared reflectance anomalies align with potential soil moisture depletion or canopy loss across the central sector.',
  confidence = 0.865,
  affectedAreaKm2 = 14.8,
  changeType = 'Potential Land-Cover Anomaly'
}) => {
  const toneMap: Record<PriorityLevel, 'critical' | 'warning' | 'info' | 'neutral'> = {
    critical: 'critical',
    high: 'warning',
    medium: 'info',
    low: 'neutral'
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded p-5 text-[var(--text-primary)] flex flex-col justify-between h-full shadow-xs">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[var(--accent-blue)]" />
            <h3 className="font-['Syne'] font-bold text-base text-[var(--text-primary)] tracking-wide">
              Actionable Intelligence Brief
            </h3>
          </div>
          <StatusBadge
            label={`${priority} Priority`}
            tone={toneMap[priority]}
            size="sm"
          />
        </div>

        <div className="mt-4 space-y-3.5 text-xs">
          {/* Anomaly Category */}
          <div className="p-3 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded">
            <span className="text-[var(--text-muted)] block font-mono uppercase text-[10px] tracking-wider mb-0.5">
              Detected Phenomenon
            </span>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {changeType}
            </p>
            <div className="mt-1 flex items-center gap-3 font-mono text-[11px] text-[var(--text-secondary)]">
              <span>Impact: <strong className="text-[var(--text-primary)]">{affectedAreaKm2.toFixed(2)} km²</strong></span>
              <span>·</span>
              <span>Confidence: <strong className="text-[var(--accent-blue)]">{(confidence * 100).toFixed(1)}%</strong></span>
            </div>
          </div>

          {/* Recommended Action */}
          <div>
            <span className="text-[var(--text-muted)] block font-mono uppercase text-[10px] tracking-wider mb-1">
              Recommended Operational Action
            </span>
            <div className="p-3 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded flex items-start gap-2.5">
              <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${priority === 'critical' ? 'text-rose-500' : 'text-amber-500'}`} />
              <div>
                <p className="text-xs font-semibold text-[var(--text-primary)] leading-snug">
                  {recommendedAction}
                </p>
                <p className="text-[var(--text-secondary)] mt-1 leading-relaxed text-[11px] font-sans">
                  Derived from multi-spectral threshold delta and VQC quantum statevector anomaly probability.
                </p>
              </div>
            </div>
          </div>

          {/* Monitoring Protocol */}
          <div>
            <span className="text-[var(--text-muted)] block font-mono uppercase text-[10px] tracking-wider mb-1">
              Monitoring Schedule
            </span>
            <div className="p-3 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[var(--accent-blue)] shrink-0 mt-0.5" />
              <p className="text-[var(--text-secondary)] leading-relaxed text-[11px] font-sans">
                {monitoring}
              </p>
            </div>
          </div>

          {/* Scientific Insight */}
          <div>
            <span className="text-[var(--text-muted)] block font-mono uppercase text-[10px] tracking-wider mb-1">
              Remote Sensing Synthesis
            </span>
            <div className="p-3 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[var(--text-muted)] shrink-0 mt-0.5" />
              <p className="text-[var(--text-secondary)] leading-relaxed text-[11px] font-sans">
                {insight}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Human-in-the-loop caveat */}
      <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] flex items-center justify-between font-mono">
        <span>Empirical Decision Support</span>
        <span className="text-[var(--accent-blue)]">Human-in-the-loop review</span>
      </div>
    </div>
  );
};
