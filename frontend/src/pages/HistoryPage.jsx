import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ApplicantModal } from '../components/ApplicantModal';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import { API_BASE_URL } from '../constants';

export const HistoryPage = ({ initialSearch = '', onSearchChange }) => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const [riskLevel, setRiskLevel] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [applicantToDelete, setApplicantToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (initialSearch !== undefined && initialSearch !== search) {
      setSearch(initialSearch);
      setPage(1);
    }
  }, [initialSearch]);

  useEffect(() => {
    fetchHistory();
  }, [page, search, riskLevel]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/predictions`, {
        params: {
          page,
          limit: 10,
          search: search || undefined,
          riskLevel: riskLevel || undefined,
        }
      });

      if (res.data && res.data.data) {
        setPredictions(res.data.data.predictions || []);
        if (res.data.data.pagination) {
          setTotalPages(res.data.data.pagination.totalPages || 1);
        }
      }
    } catch (e) {
      console.warn('History API fetch error:', e.message);
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!applicantToDelete) return;
    try {
      setIsDeleting(true);
      await axios.delete(`${API_BASE_URL}/predictions/${applicantToDelete.id}`);
      setApplicantToDelete(null);
      fetchHistory();
    } catch (e) {
      console.error('Delete error:', e);
      setPredictions((prev) => prev.filter((p) => p.id !== applicantToDelete.id));
      setApplicantToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page-body">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              Historical Loan Decisions & Audit Trail
            </h2>
            <div className="card-subtitle">
              Comprehensive log of all credit risk assessments and model versions
            </div>
          </div>

          {/* Search and Filters */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search applicant or loan ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (onSearchChange) onSearchChange(e.target.value);
                  setPage(1);
                }}
                style={{ width: '240px', padding: '6px 28px 6px 10px', fontSize: '13px' }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    if (onSearchChange) onSearchChange('');
                    setPage(1);
                  }}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: '2px',
                    lineHeight: 1,
                  }}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={riskLevel}
              onChange={(e) => { setRiskLevel(e.target.value); setPage(1); }}
              style={{ padding: '6px 10px', fontSize: '13px' }}
            >
              <option value="">All Risk Levels</option>
              <option value="LOW">Low Risk (Approved)</option>
              <option value="MEDIUM">Moderate Risk (Review)</option>
              <option value="HIGH">High Risk (Rejected)</option>
            </select>
          </div>
        </div>

        {/* Audit Table */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Applicant Name</th>
                <th>Assessment Date</th>
                <th>Calibrated Prob</th>
                <th>Risk Score</th>
                <th>Cutoff Used</th>
                <th>Decision</th>
                <th>Risk Tier</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {predictions.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No historical loan records found.
                  </td>
                </tr>
              ) : (
                predictions.map((p) => {
                  const prob = (p.probability * 100).toFixed(2);
                  const isLow = p.riskLevel === 'LOW' || p.decision === 'APPROVED';
                  const isMed = p.riskLevel === 'MEDIUM' || p.decision === 'MANUAL_REVIEW';
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.applicantName}</td>
                      <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() + ' ' + new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                      </td>
                      <td style={{ fontWeight: 700, color: isLow ? '#059669' : isMed ? '#D97706' : '#DC2626' }}>
                        {prob}%
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {p.riskScore !== undefined ? p.riskScore : Math.round(p.probability * 1000)}
                      </td>
                      <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                        {p.thresholdUsed || 0.05}
                      </td>
                      <td>
                        <span className={`badge ${isLow ? 'badge-low' : isMed ? 'badge-medium' : 'badge-high'}`}>
                          {p.decision || (isLow ? 'APPROVED' : isMed ? 'REVIEW' : 'REJECTED')}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', fontWeight: 500 }}>
                        {p.riskLevel}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedApplicant(p)}
                            title="Inspect Details"
                          >
                            View
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setApplicantToDelete(p)}
                            style={{ color: '#DC2626' }}
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Page {page} of {totalPages}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Inspector */}
      {selectedApplicant && (
        <ApplicantModal applicant={selectedApplicant} onClose={() => setSelectedApplicant(null)} />
      )}

      {/* Delete Confirmation Modal */}
      {applicantToDelete && (
        <DeleteConfirmationModal
          isOpen={!!applicantToDelete}
          applicant={applicantToDelete}
          onClose={() => setApplicantToDelete(null)}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};
