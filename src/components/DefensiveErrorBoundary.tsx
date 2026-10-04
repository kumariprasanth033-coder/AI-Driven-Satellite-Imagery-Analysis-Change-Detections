import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class DefensiveErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('DefensiveErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-5 my-3 bg-[var(--surface)] border border-[var(--warning)]/40 rounded-[var(--radius-sm)] text-[var(--text-primary)] shadow-xs">
          <div className="flex items-center gap-2.5 mb-1.5">
            <AlertTriangle className="w-4 h-4 text-[var(--warning)] shrink-0" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)] font-['Syne']">
              {this.props.fallbackTitle || 'Component Rendering Safeguard'}
            </h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">
            A non-fatal rendering irregularity occurred. The platform isolated this module without affecting other services.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="geo-btn-secondary"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry Component</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
