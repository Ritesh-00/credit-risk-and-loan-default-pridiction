import React from 'react';

export const ApplicantModal = ({ applicant, onClose }) => {
  if (!applicant) return null;

  const isLow = applicant.riskLevel === 'LOW' || applicant.decision === 'APPROVED';
  const isMed = applicant.riskLevel === 'MEDIUM' || applicant.decision === 'MANUAL_REVIEW';
  const data = applicant.applicantData || {};

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(2px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid var(--border-color)',
        padding: '24px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)' }}>
              {applicant.applicantName || 'Loan Applicant Record'}
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Assessed on: {applicant.createdAt ? new Date(applicant.createdAt).toLocaleString() : 'Recent'} | Model: {applicant.modelVersion || '1.0.0'}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#F1F5F9',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '16px',
              fontWeight: 600
            }}
          >
            ✕
          </button>
        </div>

        {/* Assessment Decision Summary */}
        <div style={{
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: isLow ? '#ECFDF5' : isMed ? '#FFFBEB' : '#FEF2F2',
          border: `1px solid ${isLow ? '#A7F3D0' : isMed ? '#FDE68A' : '#FECACA'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Decision & Risk Status</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: isLow ? '#065F46' : isMed ? '#92400E' : '#991B1B', marginTop: '2px' }}>
              {applicant.decision || (isLow ? 'APPROVED' : isMed ? 'MANUAL REVIEW' : 'REJECTED')} ({applicant.riskLevel || 'UNKNOWN'})
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Calibrated Default Probability</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', textAlign: 'right', marginTop: '2px' }}>
              {(applicant.probability * 100).toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Financial & Demographic Parameters Grid */}
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px' }}>
          Applicant Financial Profile
        </h3>

        <div className="grid-2" style={{ gap: '12px', marginBottom: '20px' }}>
          <div style={{ padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Annual Total Income</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
              ${Number(data.AMT_INCOME_TOTAL || 0).toLocaleString()}
            </div>
          </div>

          <div style={{ padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Requested Loan Amount</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
              ${Number(data.AMT_CREDIT || 0).toLocaleString()}
            </div>
          </div>

          <div style={{ padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Loan Annuity Payment</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
              ${Number(data.AMT_ANNUITY || 0).toLocaleString()}
            </div>
          </div>

          <div style={{ padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Loan Contract Type</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
              {data.NAME_CONTRACT_TYPE || 'Cash loans'}
            </div>
          </div>

          <div style={{ padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Education Level</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
              {data.NAME_EDUCATION_TYPE || 'Secondary special'}
            </div>
          </div>

          <div style={{ padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>External Bureau Rating (Avg)</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
              {(((Number(data.EXT_SOURCE_1 || 0.5) + Number(data.EXT_SOURCE_2 || 0.5) + Number(data.EXT_SOURCE_3 || 0.5)) / 3)).toFixed(3)}
            </div>
          </div>
        </div>

        {/* Close Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
