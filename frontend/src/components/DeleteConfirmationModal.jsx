import React from 'react';
import { Trash2, X, Loader2 } from 'lucide-react';

export const DeleteConfirmationModal = ({
  isOpen,
  applicant,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!isOpen || !applicant) return null;

  const isLow = applicant.riskLevel === 'LOW' || applicant.decision === 'APPROVED';
  const isMed = applicant.riskLevel === 'MEDIUM' || applicant.decision === 'MANUAL_REVIEW';
  const badgeClass = isLow ? 'badge-low' : isMed ? 'badge-medium' : 'badge-high';
  const decisionText = applicant.decision || (isLow ? 'APPROVED' : isMed ? 'REVIEW' : 'REJECTED');
  const prob = (applicant.probability * 100).toFixed(2);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        width: '100%',
        maxWidth: '460px',
        border: '1px solid var(--border-color)',
        padding: '24px',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: '#F1F5F9',
            border: 'none',
            cursor: isDeleting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            transition: 'background-color 0.15s ease'
          }}
          title="Cancel"
        >
          <X size={16} />
        </button>

        {/* Modal Header with Warning Icon */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: '#FEF2F2',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '1px solid #FECACA'
          }}>
            <Trash2 size={22} strokeWidth={2} />
          </div>
          <div style={{ paddingRight: '24px' }}>
            <h3 style={{
              fontSize: '17px',
              fontWeight: 700,
              color: 'var(--text-main)',
              margin: '0 0 4px 0'
            }}>
              Delete Assessment Record?
            </h3>
            <p style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              margin: 0,
              lineHeight: 1.45
            }}>
              Are you sure you want to delete this record? This will permanently remove it from the historical audit trail.
            </p>
          </div>
        </div>

        {/* Applicant Summary Card */}
        <div style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          padding: '14px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)' }}>
              {applicant.applicantName}
            </span>
            <span className={`badge ${badgeClass}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
              {decisionText}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Default Risk: </span>
              <strong style={{ color: isLow ? '#059669' : isMed ? '#D97706' : '#DC2626' }}>{prob}%</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Cutoff: </span>
              <strong>{applicant.thresholdUsed || 0.05}</strong>
            </div>
            <div style={{ gridColumn: 'span 2', color: 'var(--text-muted)' }}>
              <span>Assessed: </span>
              <span style={{ color: 'var(--text-main)' }}>
                {applicant.createdAt ? new Date(applicant.createdAt).toLocaleString() : 'Recent'}
              </span>
            </div>
            {applicant.id && (
              <div style={{ gridColumn: 'span 2', color: 'var(--text-muted)', fontSize: '11px', wordBreak: 'break-all' }}>
                <span>Record ID: </span>
                <code style={{ backgroundColor: '#E2E8F0', padding: '1px 5px', borderRadius: '4px', fontSize: '11px' }}>
                  {applicant.id}
                </code>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px 0 rgba(220, 38, 38, 0.25)',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) e.currentTarget.style.backgroundColor = '#B91C1C';
            }}
            onMouseLeave={(e) => {
              if (!isDeleting) e.currentTarget.style.backgroundColor = '#DC2626';
            }}
          >
            {isDeleting ? (
              <>
                <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={15} />
                Delete Record
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
