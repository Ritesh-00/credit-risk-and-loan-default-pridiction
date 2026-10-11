import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, ChevronDown, X, Loader2, FileText, ArrowRight, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { API_BASE_URL, SAMPLE_PRESETS, TABS } from '../constants';

export const Navbar = ({
  activeTabTitle = 'Executive Risk Dashboard & Portfolio Metrics',
  onSearchSubmit,
  onSelectApplicant,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [presetMatches, setPresetMatches] = useState([]);

  const containerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch matching records from API and sample presets when user types
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setPresetMatches([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      const q = searchTerm.trim().toLowerCase();

      // Match against static presets
      const matchedPresets = SAMPLE_PRESETS.filter((p) => {
        const name = (p.data?.applicantName || '').toLowerCase();
        const title = (p.title || '').toLowerCase();
        return name.includes(q) || title.includes(q);
      }).map((preset) => ({
        id: preset.id,
        applicantName: preset.data.applicantName,
        riskLevel: preset.badgeType === 'low' ? 'LOW' : preset.badgeType === 'medium' ? 'MEDIUM' : 'HIGH',
        decision: preset.badgeType === 'low' ? 'APPROVED' : preset.badgeType === 'medium' ? 'MANUAL_REVIEW' : 'REJECTED',
        probability: preset.badgeType === 'low' ? 0.018 : preset.badgeType === 'medium' ? 0.049 : 0.224,
        applicantData: preset.data,
        isPreset: true,
        presetTitle: preset.title,
        modelVersion: '1.0.0 (Sample)',
        createdAt: new Date().toISOString(),
      }));
      setPresetMatches(matchedPresets);

      // Query backend predictions API
      try {
        const res = await axios.get(`${API_BASE_URL}/predictions`, {
          params: { search: searchTerm.trim(), limit: 6 }
        });

        if (res.data && res.data.data && Array.isArray(res.data.data.predictions)) {
          setResults(res.data.data.predictions);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.warn('Navbar search error:', err.message);
        setResults([]);
      } finally {
        setIsLoading(false);
        setIsOpen(true);
      }
    }, 250);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSubmit = () => {
    if (!searchTerm.trim()) return;
    setIsOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(searchTerm.trim());
    }
  };

  const handleItemClick = (applicant) => {
    setIsOpen(false);
    if (onSelectApplicant) {
      onSelectApplicant(applicant);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setPresetMatches([]);
    setIsOpen(false);
  };

  const totalHits = results.length + presetMatches.length;

  return (
    <header style={{
      height: '68px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Page Title */}
      <div>
        <h1 style={{
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--text-main)',
          margin: 0,
          letterSpacing: '-0.01em'
        }}>
          {activeTabTitle}
        </h1>
      </div>

      {/* Right Controls: Search Bar & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Search Bar with Autocomplete Dropdown */}
        <div ref={containerRef} style={{ position: 'relative' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            position: 'relative'
          }}>
            <Search
              size={16}
              color="#94A3B8"
              style={{
                position: 'absolute',
                left: '12px',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Search loans, applicants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (searchTerm.trim().length > 0) setIsOpen(true);
              }}
              onKeyDown={handleKeyDown}
              style={{
                width: '280px',
                padding: '8px 36px 8px 36px',
                borderRadius: '8px',
                border: isOpen ? '1px solid var(--primary-blue)' : '1px solid var(--border-color)',
                boxShadow: isOpen ? '0 0 0 3px rgba(0, 102, 255, 0.12)' : 'none',
                backgroundColor: '#FFFFFF',
                fontSize: '13px',
                color: 'var(--text-main)',
                outline: 'none',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
              }}
            />

            {/* Loading Spinner or Clear Button */}
            <div style={{
              position: 'absolute',
              right: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {isLoading && (
                <Loader2
                  size={15}
                  color="#94A3B8"
                  style={{ animation: 'spin 1s linear infinite' }}
                />
              )}
              {searchTerm && !isLoading && (
                <button
                  type="button"
                  onClick={clearSearch}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px'
                  }}
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Results Dropdown */}
          {isOpen && searchTerm.trim().length > 0 && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '380px',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 100,
              maxHeight: '440px',
              overflowY: 'auto',
              padding: '8px 0'
            }}>
              {/* Dropdown Header */}
              <div style={{
                padding: '6px 16px 8px 16px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#64748B',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>Matching Records ({totalHits})</span>
                <span style={{ fontSize: '10.5px', color: '#94A3B8', textTransform: 'none', fontWeight: 500 }}>
                  Press Enter ↵ to view in History
                </span>
              </div>

              {/* Empty State */}
              {totalHits === 0 && !isLoading && (
                <div style={{
                  padding: '24px 16px',
                  textAlign: 'center',
                  color: 'var(--text-muted)'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                    No applicant found
                  </div>
                  <div style={{ fontSize: '12px' }}>
                    No loan records match &ldquo;{searchTerm}&rdquo;.
                  </div>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    style={{
                      marginTop: '12px',
                      fontSize: '12px',
                      color: 'var(--primary-blue)',
                      fontWeight: 600,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Search full historical audit trail →
                  </button>
                </div>
              )}

              {/* Database Results */}
              {results.length > 0 && (
                <div>
                  <div style={{
                    padding: '8px 16px 4px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#94A3B8'
                  }}>
                    Assessed Loans in Database
                  </div>
                  {results.map((item) => {
                    const prob = (item.probability * 100).toFixed(1);
                    const isLow = item.riskLevel === 'LOW' || item.decision === 'APPROVED';
                    const isMed = item.riskLevel === 'MEDIUM' || item.decision === 'MANUAL_REVIEW';
                    const badgeText = isLow ? 'Approved' : isMed ? 'In Review' : 'Rejected';
                    const badgeBg = isLow ? '#ECFDF5' : isMed ? '#FFFBEB' : '#FEF2F2';
                    const badgeColor = isLow ? '#059669' : isMed ? '#D97706' : '#DC2626';
                    const creditAmt = item.applicantData?.AMT_CREDIT
                      ? `$${Number(item.applicantData.AMT_CREDIT).toLocaleString()}`
                      : null;

                    return (
                      <div
                        key={item.id || item._id}
                        onClick={() => handleItemClick(item)}
                        style={{
                          padding: '10px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'background-color 0.12s ease',
                          borderBottom: '1px solid #F8FAFC'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: badgeBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: badgeColor,
                            flexShrink: 0
                          }}>
                            {isLow ? <CheckCircle2 size={16} /> : isMed ? <AlertTriangle size={16} /> : <XCircle size={16} />}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.25 }}>
                              {item.applicantName}
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              Default Risk: <strong style={{ color: badgeColor }}>{prob}%</strong>
                              {creditAmt && ` • Loan: ${creditAmt}`}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            backgroundColor: badgeBg,
                            color: badgeColor,
                            display: 'inline-block'
                          }}>
                            {badgeText}
                          </span>
                          <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '3px' }}>
                            Inspect ➔
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Sample Preset Matches */}
              {presetMatches.length > 0 && (
                <div style={{ marginTop: '4px' }}>
                  <div style={{
                    padding: '8px 16px 4px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#94A3B8'
                  }}>
                    Preset Applicant Profiles
                  </div>
                  {presetMatches.map((preset) => {
                    const isLow = preset.riskLevel === 'LOW';
                    const isMed = preset.riskLevel === 'MEDIUM';
                    const badgeBg = isLow ? '#ECFDF5' : isMed ? '#FFFBEB' : '#FEF2F2';
                    const badgeColor = isLow ? '#059669' : isMed ? '#D97706' : '#DC2626';

                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleItemClick(preset)}
                        style={{
                          padding: '10px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'background-color 0.12s ease',
                          borderBottom: '1px solid #F8FAFC'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: '#EFF6FF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#0066FF',
                            flexShrink: 0
                          }}>
                            <FileText size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.25 }}>
                              {preset.applicantName}
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              Preset • {preset.presetTitle}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            backgroundColor: badgeBg,
                            color: badgeColor,
                            display: 'inline-block'
                          }}>
                            {preset.decision}
                          </span>
                          <div style={{ fontSize: '10.5px', color: '#0066FF', marginTop: '3px', fontWeight: 500 }}>
                            Preview ➔
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Footer Action */}
              <div
                onClick={handleSubmit}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#F8FAFC',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: 'var(--primary-blue)',
                  transition: 'background-color 0.12s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EFF6FF')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
              >
                <span>View all in Historical Audit Trail</span>
                <ArrowRight size={14} />
              </div>
            </div>
          )}
        </div>

        {/* User Context & Avatar (Notification bell removed) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          paddingLeft: '12px',
          borderLeft: '1px solid var(--border-color)',
          cursor: 'pointer'
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: '#EFF6FF',
            color: '#0066FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '12.5px',
            border: '1px solid #BFDBFE'
          }}>
            RO
          </div>
          <div>
            <div style={{
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--text-main)',
              lineHeight: 1.2
            }}>
              Risk Officer
            </div>
            <div style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              lineHeight: 1.2,
              marginTop: '1px'
            }}>
              Underwriting Department
            </div>
          </div>
          <ChevronDown size={15} color="#94A3B8" style={{ marginLeft: '4px' }} />
        </div>
      </div>
    </header>
  );
};
