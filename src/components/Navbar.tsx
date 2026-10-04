import React from 'react';
import { Compass, Cpu, Sun, Moon, Plus, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  activeTab: 'dashboard' | 'data' | 'analysis' | 'results';
  setActiveTab: (tab: 'dashboard' | 'data' | 'analysis' | 'results') => void;
  onNewAnalysis?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onNewAnalysis }) => {
  const { theme, effectiveTheme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-[var(--surface)] border-b border-[var(--border)] text-[var(--text-primary)] transition-colors duration-150">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-4">
        
        {/* Brand & System Identifier */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 group cursor-pointer focus:outline-none"
          >
            <div className="w-6 h-6 rounded-[var(--radius-xs)] bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] group-hover:border-[var(--accent)] transition-colors">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-['Syne'] font-bold text-sm tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors whitespace-nowrap">
                AI-Driven Satellite Imagery Analysis &amp; Change Detection
              </span>
            </div>
          </button>
        </div>

        {/* Center: Workstation Module Switcher */}
        <nav className="flex items-center p-0.5 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-sm)]">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 text-xs font-medium rounded-[var(--radius-xs)] transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`px-3 py-1 text-xs font-medium rounded-[var(--radius-xs)] transition-all cursor-pointer ${
              activeTab === 'data'
                ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Satellite Data
          </button>

          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-3 py-1 text-xs font-medium rounded-[var(--radius-xs)] transition-all cursor-pointer ${
              activeTab === 'analysis'
                ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Analysis Pipeline
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className={`px-3 py-1 text-xs font-medium rounded-[var(--radius-xs)] transition-all cursor-pointer ${
              activeTab === 'results'
                ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Results &amp; Insights
          </button>
        </nav>

        {/* Right Zone: System Telemetry, Theme Toggle & Action */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Live System Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-2 py-0.5 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)] font-mono text-[11px] text-[var(--text-secondary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
            <span>Telemetry Online</span>
            <span className="text-[var(--border-strong)]">|</span>
            <Cpu className="w-3 h-3 text-[var(--quantum)]" />
            <span>Qiskit Aer</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${effectiveTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="p-1.5 rounded-[var(--radius-xs)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label="Toggle visual theme"
          >
            {effectiveTheme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-600" />
            )}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={() => {
              if (onNewAnalysis) {
                onNewAnalysis();
              } else {
                setActiveTab('data');
              }
            }}
            className="geo-btn-primary"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Run Analysis</span>
          </button>
        </div>

      </div>
    </header>
  );
};
