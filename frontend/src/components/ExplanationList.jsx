import React from 'react';

export const ExplanationList = ({ explanations }) => {
  if (!explanations || explanations.length === 0) return null;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            Key Model Drivers & Risk Explainability
          </h3>
          <div className="card-subtitle">
            Feature-level contributions derived from applicant financial profile
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {explanations.map((item, idx) => {
          const isRiskIncreaser = item.direction === 'RISK_INCREASER' || item.contribution > 0;
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isRiskIncreaser ? '#FEF2F2' : '#F0FDF4',
                border: `1px solid ${isRiskIncreaser ? '#FECACA' : '#BBF7D0'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{
                  marginTop: '2px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: isRiskIncreaser ? '#FEE2E2' : '#DCFCE7',
                  color: isRiskIncreaser ? '#B91C1C' : '#15803D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  {isRiskIncreaser ? '▲' : '▼'}
                </div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                    {item.feature}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {item.impact}
                  </div>
                </div>
              </div>

              {item.value !== undefined && (
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  whiteSpace: 'nowrap'
                }}>
                  {item.value}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
