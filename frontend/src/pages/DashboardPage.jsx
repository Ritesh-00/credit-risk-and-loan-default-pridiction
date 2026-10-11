import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Info, ArrowRight } from 'lucide-react';
import { KpiCard } from '../components/KpiCard';
import { API_BASE_URL, TABS, OPTIMAL_THRESHOLD } from '../constants';

export const DashboardPage = ({ onNavigate }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/dashboard/summary`);
      if (res.data && res.data.data) {
        setSummary(res.data.data);
      } else {
        setSummary({
          totalPredictions: 0,
          lowRiskCount: 0,
          mediumRiskCount: 0,
          highRiskCount: 0,
          avgDefaultProbability: 0,
          riskDistribution: [],
          recentPredictions: [],
        });
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message);
      setSummary({
        totalPredictions: 0,
        lowRiskCount: 0,
        mediumRiskCount: 0,
        highRiskCount: 0,
        avgDefaultProbability: 0,
        riskDistribution: [],
        recentPredictions: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const total = summary?.totalPredictions || 0;
  const lowCount = summary?.lowRiskCount || 0;
  const medCount = summary?.mediumRiskCount || 0;
  const highCount = summary?.highRiskCount || 0;
  const avgProb = summary?.avgDefaultProbability !== undefined && summary.avgDefaultProbability !== null
    ? (summary.avgDefaultProbability * 100).toFixed(2)
    : '0.00';

  const lowPct = total > 0 ? ((lowCount / total) * 100).toFixed(1) : '0.0';
  const medPct = total > 0 ? ((medCount / total) * 100).toFixed(1) : '0.0';
  const highPct = total > 0 ? ((highCount / total) * 100).toFixed(1) : '0.0';

  return (
    <div className="page-body">
      {/* Overview Banner Card */}
      <div style={{
        padding: '22px 28px',
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.01em' }}>
            Credit Underwriting & Risk Monitoring Dashboard
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 400 }}>
            Production CatBoost classification model calibrated at <strong>{OPTIMAL_THRESHOLD}</strong> decision threshold (84.3% default capture recall).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => onNavigate(TABS.THRESHOLD_SIMULATOR)}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13.5px',
              color: '#0F172A'
            }}
          >
            Policy Simulator
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onNavigate(TABS.SINGLE_ASSESSMENT)}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            New Loan Assessment <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid-4" style={{ marginBottom: '20px' }}>
        <KpiCard
          title="Total Evaluated Loans"
          value={loading ? '...' : total.toLocaleString()}
          subtitle="Processed & saved in database"
          badge={total > 0 ? 'Live DB' : 'Empty DB'}
          badgeType="neutral"
        />
        <KpiCard
          title="Approved (Low Risk)"
          value={loading ? '...' : lowCount.toLocaleString()}
          subtitle={`${lowPct}% of total volume`}
          badge="Eligible"
          badgeType="low"
        />
        <KpiCard
          title="Manual Review Queue"
          value={loading ? '...' : medCount.toLocaleString()}
          subtitle={`${medPct}% borderline cases`}
          badge="Action Req."
          badgeType="medium"
        />
        <KpiCard
          title="Flagged High Risk (Default)"
          value={loading ? '...' : highCount.toLocaleString()}
          subtitle={`Average risk: ${avgProb}%`}
          badge="Cutoff 0.05"
          badgeType="high"
        />
      </div>

      {/* Main Grid: Risk Distribution & Recent Decisions */}
      <div className="grid-2">
        {/* Risk Distribution Breakdown */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  Portfolio Risk Tier Breakdown
                </h3>
                <div className="card-subtitle">
                  Stratified distribution based on saved database assessments
                </div>
              </div>
            </div>

            {total === 0 && !loading ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', color: 'var(--text-main)' }}>
                  No Evaluation Data in Database
                </div>
                <div style={{ fontSize: '12.5px' }}>
                  Run a <strong style={{ cursor: 'pointer', color: 'var(--primary-blue)' }} onClick={() => onNavigate(TABS.SINGLE_ASSESSMENT)}>Single Assessment</strong> or <strong style={{ cursor: 'pointer', color: 'var(--primary-blue)' }} onClick={() => onNavigate(TABS.BATCH_EVALUATION)}>Batch Assessment</strong> to populate real-time analytics.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '6px' }}>
                {/* Low Risk */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                      Low Risk / Approved <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Prob &lt; 0.05)</span>
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '13px' }}>
                      {lowCount} loans ({lowPct}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${total > 0 ? (lowCount / total) * 100 : 0}%`, backgroundColor: '#64748B', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>

                {/* Medium Risk */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B', display: 'inline-block' }} />
                      Moderate Risk / Review <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(0.05 &le; Prob &lt; 0.10)</span>
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '13px' }}>
                      {medCount} loans ({medPct}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${total > 0 ? (medCount / total) * 100 : 0}%`, backgroundColor: '#64748B', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>

                {/* High Risk */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444', display: 'inline-block' }} />
                      High Risk Default <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Prob &ge; 0.10)</span>
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '13px' }}>
                      {highCount} loans ({highPct}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${total > 0 ? (highCount / total) * 100 : 0}%`, backgroundColor: '#64748B', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Info Banner */}
          <div style={{
            marginTop: '24px',
            padding: '12px 16px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #DBEAFE',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {/* <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#0066FF',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}> */}
              {/* <Info size={18} /> */}
            {/* </div> */}
            <div style={{ fontSize: '12.5px', color: '#1E40AF', lineHeight: 1.4 }}>
              <strong>Risk Policy Note:</strong> Calibrated cutoff at 0.05 targets 84.3% default capture recall on portfolio credit applications.
            </div>
          </div>
        </div>

        {/* Recent Decisions Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                Recent Loan Decisions
              </h3>
              <div className="card-subtitle">
                Latest real-time assessments from database
              </div>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate(TABS.HISTORY)}
              style={{
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: 600
              }}
            >
              View All History
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Default Prob</th>
                  <th>Decision</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {(!summary?.recentPredictions || summary.recentPredictions.length === 0) ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                      {loading ? 'Fetching database records...' : 'No loan decisions found in database. Run an assessment to see results here.'}
                    </td>
                  </tr>
                ) : (
                  summary.recentPredictions.map((p, i) => {
                    const prob = (p.probability * 100).toFixed(1);
                    const isLow = p.riskLevel === 'LOW' || p.decision === 'APPROVED';
                    const isMed = p.riskLevel === 'MEDIUM' || p.decision === 'MANUAL_REVIEW';

                    const decisionText = isLow ? 'APPROVED' : isMed ? 'REVIEW' : 'REJECTED';
                    const badgeClass = isLow ? 'badge-low' : isMed ? 'badge-medium' : 'badge-high';
                    const statusText = isLow ? 'Approved' : isMed ? 'In Review' : 'Rejected';
                    const statusColor = isLow ? '#059669' : isMed ? '#D97706' : '#DC2626';

                    return (
                      <tr key={p.id || i}>
                        <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.applicantName}</td>
                        <td style={{ fontWeight: 600, color: '#334155' }}>{prob}%</td>
                        <td>
                          <span className={`badge ${badgeClass}`}>
                            {decisionText}
                          </span>
                        </td>
                        <td style={{ fontSize: '12.5px', fontWeight: 500, color: statusColor }}>
                          <span style={{
                            display: 'inline-block',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: statusColor,
                            marginRight: '6px'
                          }} />
                          {statusText}
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '10/6/2026'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
