import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { SingleAssessmentPage } from './pages/SingleAssessmentPage';
import { BatchEvaluationPage } from './pages/BatchEvaluationPage';
import { ThresholdSimulatorPage } from './pages/ThresholdSimulatorPage';
import { HistoryPage } from './pages/HistoryPage';
import { ModelGovernancePage } from './pages/ModelGovernancePage';
import { ApplicantModal } from './components/ApplicantModal';
import { TABS } from './constants';

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [inspectedApplicant, setInspectedApplicant] = useState(null);

  const getTabTitle = () => {
    switch (activeTab) {
      case TABS.DASHBOARD:
        return 'Executive Risk Dashboard & Portfolio Metrics';
      case TABS.SINGLE_ASSESSMENT:
        return 'Single Loan Application Risk Underwriting';
      case TABS.BATCH_EVALUATION:
        return 'High-Throughput Batch Portfolio Analysis';
      case TABS.THRESHOLD_SIMULATOR:
        return 'Policy Cutoff & Threshold Sensitivity Simulator';
      case TABS.HISTORY:
        return 'Historical Assessment Audit Log';
      case TABS.MODEL_GOVERNANCE:
        return 'Model Card & Pipeline Governance Specification';
      default:
        return 'Credit Risk & Loan Default Assessment Platform';
    }
  };

  const handleSearchSubmit = (query) => {
    setHistorySearchTerm(query);
    setActiveTab(TABS.HISTORY);
  };

  const handleSelectApplicant = (applicant) => {
    setInspectedApplicant(applicant);
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case TABS.DASHBOARD:
        return <DashboardPage onNavigate={(tab) => setActiveTab(tab)} />;
      case TABS.SINGLE_ASSESSMENT:
        return <SingleAssessmentPage />;
      case TABS.BATCH_EVALUATION:
        return <BatchEvaluationPage />;
      case TABS.THRESHOLD_SIMULATOR:
        return <ThresholdSimulatorPage />;
      case TABS.HISTORY:
        return (
          <HistoryPage
            initialSearch={historySearchTerm}
            onSearchChange={setHistorySearchTerm}
          />
        );
      case TABS.MODEL_GOVERNANCE:
        return <ModelGovernancePage />;
      default:
        return <DashboardPage onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        isOnline={true}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          activeTabTitle={getTabTitle()}
          onSearchSubmit={handleSearchSubmit}
          onSelectApplicant={handleSelectApplicant}
          onNavigate={(tab) => setActiveTab(tab)}
        />
        <main>{renderActivePage()}</main>
      </div>

      {/* Global Applicant Inspection Modal for Search and Navigation */}
      {inspectedApplicant && (
        <ApplicantModal
          applicant={inspectedApplicant}
          onClose={() => setInspectedApplicant(null)}
        />
      )}
    </div>
  );
}
