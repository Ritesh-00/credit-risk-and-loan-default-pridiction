import React from 'react';

export const KpiCard = ({ title, value, subtitle, badge, badgeType = 'neutral' }) => {
  const getBadgeStyle = () => {
    switch (badgeType) {
      case 'success':
      case 'low':
        return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
      case 'warning':
      case 'medium':
        return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
      case 'danger':
      case 'high':
        return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
      case 'blue':
      case 'neutral':
      default:
        return { bg: '#EFF6FF', text: '#0066FF', border: '#BFDBFE' };
    }
  };

  const badgeStyle = getBadgeStyle();

  return (
    <div className="card" style={{
      padding: '20px',
      margin: 0,
      backgroundColor: '#FFFFFF',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '128px'
    }}>
      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
        {title}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <div style={{
          fontSize: '28px',
          fontWeight: 800,
          color: 'var(--text-main)',
          letterSpacing: '-0.03em',
          lineHeight: 1
        }}>
          {value}
        </div>
        {badge && (
          <span style={{
            fontSize: '11.5px',
            fontWeight: 700,
            padding: '3px 9px',
            borderRadius: '9999px',
            backgroundColor: badgeStyle.bg,
            color: badgeStyle.text,
            border: `1px solid ${badgeStyle.border}`,
            lineHeight: 1.2
          }}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 400 }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};
