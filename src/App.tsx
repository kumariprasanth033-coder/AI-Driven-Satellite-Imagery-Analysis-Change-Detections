import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { SatelliteDataPage } from './pages/SatelliteDataPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { ResultsPage } from './pages/ResultsPage';
import { DefensiveErrorBoundary } from './components/DefensiveErrorBoundary';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'data' | 'analysis' | 'results'>(() => {
    try {
      const saved = localStorage.getItem('satellite_active_tab');
      if (saved && ['dashboard', 'data', 'analysis', 'results'].includes(saved)) {
        return saved as any;
      }
    } catch {}
    return 'dashboard';
  });

  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(() => {
    try {
      return localStorage.getItem('satellite_selected_dataset') || 'ds-sentinel2-drought';
    } catch {}
    return 'ds-sentinel2-drought';
  });

  const [selectedJobId, setSelectedJobId] = useState<string>(() => {
    try {
      return localStorage.getItem('satellite_selected_job') || 'job-sentinel-demo';
    } catch {}
    return 'job-sentinel-demo';
  });

  useEffect(() => {
    try {
      localStorage.setItem('satellite_active_tab', activeTab);
    } catch {}
  }, [activeTab]);

  useEffect(() => {
    try {
      localStorage.setItem('satellite_selected_dataset', selectedDatasetId);
    } catch {}
  }, [selectedDatasetId]);

  useEffect(() => {
    try {
      localStorage.setItem('satellite_selected_job', selectedJobId);
    } catch {}
  }, [selectedJobId]);

  const handleStartAnalysisFromData = (datasetId: string) => {
    setSelectedDatasetId(datasetId);
    setActiveTab('analysis');
  };

  const handleNavigateToResults = (jobId: string) => {
    setSelectedJobId(jobId);
    setActiveTab('results');
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-180">
      {/* Precision Workstation Top Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewAnalysis={() => setActiveTab('data')}
      />

      {/* Main Workstation Viewport */}
      <main className="flex-1 max-w-[1560px] w-full mx-auto px-4 sm:px-6 py-5">
        <DefensiveErrorBoundary fallbackTitle="Application Viewport Safeguard">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectDatasetForAnalysis={handleStartAnalysisFromData}
            />
          )}

          {activeTab === 'data' && (
            <SatelliteDataPage
              onStartAnalysis={handleStartAnalysisFromData}
            />
          )}

          {activeTab === 'analysis' && (
            <AnalysisPage
              selectedDatasetId={selectedDatasetId}
              onNavigateToResults={handleNavigateToResults}
            />
          )}

          {activeTab === 'results' && (
            <ResultsPage
              selectedJobId={selectedJobId}
              onNavigateToData={() => setActiveTab('data')}
            />
          )}
        </DefensiveErrorBoundary>
      </main>

      {/* High-Precision Technical Hairline Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-2.5 text-xs text-[var(--text-muted)] font-mono transition-colors duration-180">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <span>AI-DRIVEN SATELLITE IMAGERY ANALYSIS &amp; CHANGE DETECTION</span>
          <span>SIMULATION: QISKIT 1.X AER STATEVECTOR · WGS 84 (EPSG:4326) · UNCLASSIFIED</span>
        </div>
      </footer>
    </div>
  );
}
