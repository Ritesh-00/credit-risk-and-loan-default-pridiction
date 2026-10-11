import React from 'react';
import { OPTIMAL_THRESHOLD } from '../constants';

export const RiskGauge = ({ result, customThreshold }) => {
  if (!result) return null;

  const threshold = customThreshold !== undefined ? customThreshold : (result.thresholdUsed || OPTIMAL_THRESHOLD);
  const probPercent = parseFloat((result.probability * 100).toFixed(2));
  const threshPercent = parseFloat((threshold * 100).toFixed(1));

  const isLow = result.riskLevel === 'LOW' || result.decision === 'APPROVED';
  const isMed = result.riskLevel === 'MEDIUM' || result.decision === 'MANUAL_REVIEW';
  const isHigh = result.riskLevel === 'HIGH' || result.decision === 'REJECTED';

  const getDecisionConfig = () => {
    if (isLow) {
      return {
        label: 'APPROVED (LOW RISK)',
        bg: 'var(--status-low-bg)',
        text: 'var(--status-low-text)',
        border: 'var(--status-low-border)',
        desc: `Default probability (${probPercent}%) is safely below the risk threshold of ${threshPercent}%. Application approved for immediate underwriting.`
      };
    }
    if (isMed) {
      return {
        label: 'MANUAL REVIEW (MODERATE RISK)',
        bg: 'var(--status-med-bg)',
        text: 'var(--status-med-text)',
        border: 'var(--status-med-border)',
        desc: `Default probability (${probPercent}%) borders the threshold of ${threshPercent}%. Requires secondary income & collateral verification.`
      };
    }
    return {
      label: 'REJECTED (HIGH RISK DEFAULT)',
      bg: 'var(--status-high-bg)',
      text: 'var(--status-high-text)',
      border: 'var(--status-high-border)',
      desc: `Default probability (${probPercent}%) exceeds the risk tolerance cutoff (${threshPercent}%). High likelihood of delinquency.`
    };
  };

  const decisionConfig = getDecisionConfig();

  return (
    <div className="card" style={{ border: `1px solid ${decisionConfig.border}` }}>
      <div className="card-header">
        <div>
          <h2 className="card-title">
            Loan Decision & Risk Evaluation
          </h2>
          <div className="card-subtitle">
            Calibrated CatBoost Inference Model (Version {result.modelVersion || '1.0.0'})
          </div>
        </div>

        <div style={{
          padding: '6px 14px',
          borderRadius: '9999px',
          backgroundColor: decisionConfig.bg,
          color: decisionConfig.text,
          border: `1px solid ${decisionConfig.border}`,
          fontWeight: 700,
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
        }}>
          {decisionConfig.label}
        </div>
      </div>

      {/* Probability Bar & Threshold Visualizer */}
      <div style={{ margin: '20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Calibrated Default Probability:</span>
            <span style={{ fontSize: '20px', fontWeight: 700, color: decisionConfig.text, marginLeft: '8px' }}>
              {probPercent}%
            </span>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Risk Tolerance Cutoff:</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary-blue)', marginLeft: '6px' }}>
              {threshPercent}%
            </span>
          </div>
        </div>

        {/* Progress bar with marker */}
        <div style={{ position: 'relative', height: '14px', backgroundColor: '#E2E8F0', borderRadius: '7px', overflow: 'visible' }}>
          {/* Active fill */}
          <div style={{
            height: '100%',
            width: `${Math.min(probPercent * 2.5, 100)}%`,
            backgroundColor: isLow ? '#10B981' : isMed ? '#F59E0B' : '#EF4444',
            borderRadius: '7px',
            transition: 'width 0.4s ease'
          }} />

          {/* Threshold marker pin */}
          <div style={{
            position: 'absolute',
            left: `${Math.min(threshPercent * 2.5, 100)}%`,
            top: '-4px',
            bottom: '-4px',
            width: '3px',
            backgroundColor: 'var(--primary-dark)',
            borderRadius: '2px',
            zIndex: 2,
          }}>
            <div style={{
              position: 'absolute',
              top: '-18px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--primary-dark)',
              whiteSpace: 'nowrap'
            }}>
              Cutoff ({threshPercent}%)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-light)', marginTop: '6px' }}>
          <span>0% (Prime)</span>
          <span>5% (Threshold)</span>
          <span>15%</span>
          <span>40%+ (High Default)</span>
        </div>
      </div>

      {/* Decision Summary Banner */}
      <div style={{
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: decisionConfig.bg,
        border: `1px solid ${decisionConfig.border}`,
        color: decisionConfig.text,
        fontSize: '13.5px',
        marginBottom: '16px'
      }}>
        {decisionConfig.desc}
      </div>

      {/* Key Solvency Metrics */}
      {result.keyMetrics && (
        <div className="grid-4" style={{ marginTop: '12px' }}>
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-card-alt)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Loan-to-Income (DTI)</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
              {result.keyMetrics.creditIncomeRatio ? `${result.keyMetrics.creditIncomeRatio}x` : 'N/A'}
            </div>
          </div>

          <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-card-alt)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Annuity-to-Income</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
              {result.keyMetrics.annuityIncomeRatio ? `${(result.keyMetrics.annuityIncomeRatio * 100).toFixed(1)}%` : 'N/A'}
            </div>
          </div>

          <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-card-alt)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Applicant Age</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
              {result.keyMetrics.ageYears ? `${result.keyMetrics.ageYears} yrs` : 'N/A'}
            </div>
          </div>

          <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-card-alt)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Employment Tenure</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
              {result.keyMetrics.employedYears !== undefined ? `${result.keyMetrics.employedYears} yrs` : 'N/A'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
