import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, OPTIMAL_THRESHOLD } from '../constants';

export const ModelGovernancePage = () => {
  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => {
    fetchModelInfo();
  }, []);

  const fetchModelInfo = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/model/info`);
      if (res.data && res.data.data) {
        setModelInfo(res.data.data);
      }
    } catch (e) {
      console.warn('Model info API error:', e.message);
    }
  };

  const featureRanking = [
    { rank: 1, name: 'EXT_SOURCE_2 / EXT_SOURCE_3', type: 'Credit Bureau Index', weight: '24.8%', desc: 'Normalized external bureau credit rating scores' },
    { rank: 2, name: 'CREDIT_INCOME_RATIO (AMT_CREDIT / AMT_INCOME_TOTAL)', type: 'Financial Solvency', weight: '18.2%', desc: 'Loan amount relative to total annual earnings' },
    { rank: 3, name: 'ANNUITY_INCOME_RATIO (AMT_ANNUITY / AMT_INCOME_TOTAL)', type: 'Debt Burden', weight: '14.5%', desc: 'Monthly payment burden relative to monthly income' },
    { rank: 4, name: 'DAYS_EMPLOYED / EMPLOYED_YEARS', type: 'Stability', weight: '11.3%', desc: 'Years in current employment tenure' },
    { rank: 5, name: 'DAYS_BIRTH / AGE_YEARS', type: 'Demographics', weight: '9.4%', desc: 'Borrower age in years' },
    { rank: 6, name: 'NAME_EDUCATION_TYPE', type: 'Categorical Profile', weight: '7.1%', desc: 'Highest completed educational level' },
    { rank: 7, name: 'TOTAL_MISSING / MISSING_RATIO', type: 'Data Completeness', weight: '5.6%', desc: 'Applicant documentation completeness indicator' },
  ];

  return (
    <div className="page-body">
      {/* Overview Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">
              Enterprise Model Card & Governance Specification
            </h2>
            <div className="card-subtitle">
              Formal audit specification for CatBoost Credit Risk & Loan Default Classifier (Version 1.0.0)
            </div>
          </div>

          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: '12px',
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--status-low-bg)',
            color: 'var(--status-low-text)',
            border: '1px solid var(--status-low-border)'
          }}>
            Production Certified
          </span>
        </div>

        <div className="grid-3" style={{ gap: '16px' }}>
          <div style={{ padding: '12px 14px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Algorithm Architecture</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
              CatBoost Gradient Boosting
            </div>
          </div>

          <div style={{ padding: '12px 14px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Calibrated Decision Threshold</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary-blue)', marginTop: '2px' }}>
              0.05 (84.3% Default Recall)
            </div>
          </div>

          <div style={{ padding: '12px 14px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Validation Framework</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
              4-Fold Stratified K-Fold CV
            </div>
          </div>
        </div>
      </div>

      {/* Validation Metrics Grid */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              Performance & Discrimination Metrics
            </h3>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Metric Name</th>
                  <th>Value</th>
                  <th>Benchmark / Goal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>ROC-AUC Score</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary-blue)' }}>0.7628</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>&gt; 0.75 (Excellent discrimination)</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>PR-AUC (Avg Precision)</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary-blue)' }}>0.7523</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>High precision on imbalanced positives</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Default Recall (@ 0.05)</td>
                  <td style={{ fontWeight: 700, color: 'var(--status-low-text)' }}>84.26%</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>&gt; 75.0% target for default capture</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Precision (@ 0.05)</td>
                  <td style={{ fontWeight: 700 }}>12.83%</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Controlled false-positive screening</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>F-Beta Score (Beta = 2)</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary-blue)' }}>0.3987</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Recall weighted 2x over precision</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Production Pipeline Steps */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              End-to-End Pipeline Stages
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                1. FeatureEngineer Transformer
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Computes row missingness ratios, DTI ratio, Annuity/Income, Age & Employment anomaly years, and drops 51 uninformative ID/flag columns.
              </div>
            </div>

            <div style={{ padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                2. CatBoostPreprocessor Transformer
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Tags missing categorical tokens as <code>'Unknown'</code> and preserves high-cardinality categorical strings for CatBoost target statistics.
              </div>
            </div>

            <div style={{ padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                3. CatBoostClassifier Estimator
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Depth: 7, Iterations: 700, L2 Leaf Reg: 5, Learning Rate: 0.05, Loss Function: Logloss, Evaluation Metric: AUC.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Importance Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Top Model Feature Importance & Weights
          </h3>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Feature Name</th>
                <th>Domain Category</th>
                <th>Relative Weight</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {featureRanking.map((f) => (
                <tr key={f.rank}>
                  <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{f.rank}</td>
                  <td style={{ fontWeight: 600 }}>{f.name}</td>
                  <td>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#F1F5F9', color: 'var(--text-muted)' }}>
                      {f.type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--primary-blue)' }}>{f.weight}</td>
                  <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{f.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
