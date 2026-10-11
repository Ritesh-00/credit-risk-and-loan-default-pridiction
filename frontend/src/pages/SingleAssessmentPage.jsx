import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, ArrowRight, RotateCcw, Send, Info } from 'lucide-react';
import { RiskGauge } from '../components/RiskGauge';
import { ExplanationList } from '../components/ExplanationList';
import {
  API_BASE_URL,
  SAMPLE_PRESETS,
  CONTRACT_TYPES,
  GENDER_OPTIONS,
  EDUCATION_TYPES,
  INCOME_TYPES,
  HOUSING_TYPES,
  OCCUPATION_TYPES,
  OPTIMAL_THRESHOLD,
} from '../constants';

export const SingleAssessmentPage = () => {
  const [formData, setFormData] = useState({
    applicantName: 'Michael Chang',
    NAME_CONTRACT_TYPE: 'Cash loans',
    CODE_GENDER: 'M',
    FLAG_OWN_CAR: 'N',
    FLAG_OWN_REALTY: 'Y',
    CNT_CHILDREN: 0,
    CNT_FAM_MEMBERS: 2,
    AMT_INCOME_TOTAL: 195000,
    AMT_CREDIT: 480000,
    AMT_ANNUITY: 25500,
    AMT_GOODS_PRICE: 420000,
    NAME_TYPE_SUITE: 'Unaccompanied',
    NAME_INCOME_TYPE: 'Working',
    NAME_EDUCATION_TYPE: 'Higher education',
    NAME_FAMILY_STATUS: 'Married',
    NAME_HOUSING_TYPE: 'House / apartment',
    ageYears: 36,
    employedYears: 4.5,
    OCCUPATION_TYPE: 'Core staff',
    ORGANIZATION_TYPE: 'Business Entity Type 3',
    EXT_SOURCE_1: 0.55,
    EXT_SOURCE_2: 0.58,
    EXT_SOURCE_3: 0.52,
    OWN_CAR_AGE: 0,
    threshold: OPTIMAL_THRESHOLD,
  });

  const [loading, setLoading] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const applyPreset = (preset) => {
    const d = preset.data;
    const ageYrs = d.DAYS_BIRTH ? Math.round(-d.DAYS_BIRTH / 365.25) : 38;
    const empYrs = d.DAYS_EMPLOYED ? parseFloat((-d.DAYS_EMPLOYED / 365.25).toFixed(1)) : 3.5;

    setFormData({
      applicantName: d.applicantName || preset.title,
      NAME_CONTRACT_TYPE: d.NAME_CONTRACT_TYPE || 'Cash loans',
      CODE_GENDER: d.CODE_GENDER || 'M',
      FLAG_OWN_CAR: d.FLAG_OWN_CAR || 'N',
      FLAG_OWN_REALTY: d.FLAG_OWN_REALTY || 'Y',
      CNT_CHILDREN: d.CNT_CHILDREN || 0,
      CNT_FAM_MEMBERS: d.CNT_FAM_MEMBERS || 1,
      AMT_INCOME_TOTAL: d.AMT_INCOME_TOTAL || 180000,
      AMT_CREDIT: d.AMT_CREDIT || 450000,
      AMT_ANNUITY: d.AMT_ANNUITY || 25000,
      AMT_GOODS_PRICE: d.AMT_GOODS_PRICE || 400000,
      NAME_TYPE_SUITE: d.NAME_TYPE_SUITE || 'Unaccompanied',
      NAME_INCOME_TYPE: d.NAME_INCOME_TYPE || 'Working',
      NAME_EDUCATION_TYPE: d.NAME_EDUCATION_TYPE || 'Secondary / secondary special',
      NAME_FAMILY_STATUS: d.NAME_FAMILY_STATUS || 'Married',
      NAME_HOUSING_TYPE: d.NAME_HOUSING_TYPE || 'House / apartment',
      ageYears: ageYrs,
      employedYears: empYrs,
      OCCUPATION_TYPE: d.OCCUPATION_TYPE || 'Laborers',
      ORGANIZATION_TYPE: d.ORGANIZATION_TYPE || 'Business Entity Type 3',
      EXT_SOURCE_1: d.EXT_SOURCE_1 || 0.5,
      EXT_SOURCE_2: d.EXT_SOURCE_2 || 0.5,
      EXT_SOURCE_3: d.EXT_SOURCE_3 || 0.5,
      OWN_CAR_AGE: d.OWN_CAR_AGE || 0,
      threshold: OPTIMAL_THRESHOLD,
    });
    setAssessmentResult(null);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const daysBirth = -Math.round(Number(formData.ageYears) * 365.25);
      const daysEmployed = -Math.round(Number(formData.employedYears) * 365.25);

      const payload = {
        applicantName: formData.applicantName,
        threshold: Number(formData.threshold) || OPTIMAL_THRESHOLD,
        applicantData: {
          NAME_CONTRACT_TYPE: formData.NAME_CONTRACT_TYPE,
          CODE_GENDER: formData.CODE_GENDER,
          FLAG_OWN_CAR: formData.FLAG_OWN_CAR,
          FLAG_OWN_REALTY: formData.FLAG_OWN_REALTY,
          CNT_CHILDREN: Number(formData.CNT_CHILDREN) || 0,
          CNT_FAM_MEMBERS: Number(formData.CNT_FAM_MEMBERS) || 1,
          AMT_INCOME_TOTAL: Number(formData.AMT_INCOME_TOTAL) || 150000,
          AMT_CREDIT: Number(formData.AMT_CREDIT) || 400000,
          AMT_ANNUITY: Number(formData.AMT_ANNUITY) || 20000,
          AMT_GOODS_PRICE: Number(formData.AMT_GOODS_PRICE) || 350000,
          NAME_TYPE_SUITE: formData.NAME_TYPE_SUITE,
          NAME_INCOME_TYPE: formData.NAME_INCOME_TYPE,
          NAME_EDUCATION_TYPE: formData.NAME_EDUCATION_TYPE,
          NAME_FAMILY_STATUS: formData.NAME_FAMILY_STATUS,
          NAME_HOUSING_TYPE: formData.NAME_HOUSING_TYPE,
          DAYS_BIRTH: daysBirth,
          DAYS_EMPLOYED: daysEmployed,
          OCCUPATION_TYPE: formData.OCCUPATION_TYPE,
          ORGANIZATION_TYPE: formData.ORGANIZATION_TYPE,
          EXT_SOURCE_1: Number(formData.EXT_SOURCE_1) || null,
          EXT_SOURCE_2: Number(formData.EXT_SOURCE_2) || 0.5,
          EXT_SOURCE_3: Number(formData.EXT_SOURCE_3) || 0.5,
          OWN_CAR_AGE: formData.FLAG_OWN_CAR === 'Y' ? Number(formData.OWN_CAR_AGE) : null,
        }
      };

      const res = await axios.post(`${API_BASE_URL}/predictions`, payload);
      if (res.data && res.data.data) {
        setAssessmentResult(res.data.data);
      }
    } catch (err) {
      console.error('API assessment error:', err);
      const msg = err.response?.data?.message || err.message || 'Error communicating with ML scoring service';
      setErrorMsg(msg);
      setAssessmentResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-body">
      {/* Presets Header Card */}
      <div className="card" style={{ marginBottom: '20px', padding: '18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={16}  /> Quick Test Presets
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Select a benchmark borrower profile to auto-populate underwriting parameters:
            </div>
          </div>
        </div>

        <div className="grid-3">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              style={{
                padding: '14px 16px',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color)',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0066FF')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {preset.title}
                </span>
                <span className={`badge badge-${preset.badgeType}`}>
                  {preset.badgeType.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {preset.subtitle}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Input Form (Left) & Assessment Results (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: assessmentResult ? '1fr 1fr' : '1fr', gap: '20px' }}>
        {/* Form Container */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                Loan Application Underwriting Form
              </h2>
              <div className="card-subtitle">
                Enter applicant financials for real-time CatBoost default scoring
              </div>
            </div>
          </div>

          {errorMsg && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              color: '#991B1B',
              fontSize: '13px',
              marginBottom: '16px'
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Section 1: Demographics */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0066FF', marginBottom: '10px', borderBottom: '1px solid #EFF6FF', paddingBottom: '4px' }}>
                1. Applicant Profile
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px', color: '#334155' }}>Applicant Full Name</label>
                  <input
                    type="text"
                    style={{ width: '100%' }}
                    value={formData.applicantName}
                    onChange={(e) => handleInputChange('applicantName', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px', color: '#334155' }}>Loan Contract Type</label>
                  <select
                    style={{ width: '100%' }}
                    value={formData.NAME_CONTRACT_TYPE}
                    onChange={(e) => handleInputChange('NAME_CONTRACT_TYPE', e.target.value)}
                  >
                    {CONTRACT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px', color: '#334155' }}>Gender</label>
                  <select
                    style={{ width: '100%' }}
                    value={formData.CODE_GENDER}
                    onChange={(e) => handleInputChange('CODE_GENDER', e.target.value)}
                  >
                    {GENDER_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px', color: '#334155' }}>Education Level</label>
                  <select
                    style={{ width: '100%' }}
                    value={formData.NAME_EDUCATION_TYPE}
                    onChange={(e) => handleInputChange('NAME_EDUCATION_TYPE', e.target.value)}
                  >
                    {EDUCATION_TYPES.map((ed) => <option key={ed} value={ed}>{ed}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Financial Metrics */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0066FF', marginBottom: '10px', borderBottom: '1px solid #EFF6FF', paddingBottom: '4px' }}>
                2. Financial & Solvency Metrics
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px', color: '#334155' }}>Total Annual Income ($)</label>
                  <input
                    type="number"
                    style={{ width: '100%' }}
                    value={formData.AMT_INCOME_TOTAL}
                    onChange={(e) => handleInputChange('AMT_INCOME_TOTAL', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px', color: '#334155' }}>Requested Credit Amount ($)</label>
                  <input
                    type="number"
                    style={{ width: '100%' }}
                    value={formData.AMT_CREDIT}
                    onChange={(e) => handleInputChange('AMT_CREDIT', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px', color: '#334155' }}>Annuity Payment ($)</label>
                  <input
                    type="number"
                    style={{ width: '100%' }}
                    value={formData.AMT_ANNUITY}
                    onChange={(e) => handleInputChange('AMT_ANNUITY', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px', color: '#334155' }}>Goods Price ($)</label>
                  <input
                    type="number"
                    style={{ width: '100%' }}
                    value={formData.AMT_GOODS_PRICE}
                    onChange={(e) => handleInputChange('AMT_GOODS_PRICE', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Stability & Bureau Ratings */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0066FF', marginBottom: '10px', borderBottom: '1px solid #EFF6FF', paddingBottom: '4px' }}>
                3. Employment Tenure & Bureau Ratings
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px', color: '#334155' }}>Age (Years)</label>
                  <input
                    type="number"
                    style={{ width: '100%' }}
                    value={formData.ageYears}
                    onChange={(e) => handleInputChange('ageYears', e.target.value)}
                    min={18}
                    max={75}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px', color: '#334155' }}>Employment Tenure (Years)</label>
                  <input
                    type="number"
                    step="0.1"
                    style={{ width: '100%' }}
                    value={formData.employedYears}
                    onChange={(e) => handleInputChange('employedYears', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px', color: '#334155' }}>External Bureau Score 2 (0.0 - 1.0)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    style={{ width: '100%' }}
                    value={formData.EXT_SOURCE_2}
                    onChange={(e) => handleInputChange('EXT_SOURCE_2', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px', color: '#334155' }}>External Bureau Score 3 (0.0 - 1.0)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    style={{ width: '100%' }}
                    value={formData.EXT_SOURCE_3}
                    onChange={(e) => handleInputChange('EXT_SOURCE_3', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => applyPreset(SAMPLE_PRESETS[1])}
                style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: 600 }}
              >
                Reset
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ padding: '8px 20px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {loading ? 'Evaluating Model...' : 'Assess Loan Risk'}
              </button>
            </div>
          </form>
        </div>

        {/* Results Container */}
        {assessmentResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <RiskGauge result={assessmentResult} customThreshold={formData.threshold} />
            <ExplanationList explanations={assessmentResult.explanation} />
          </div>
        )}
      </div>
    </div>
  );
};
