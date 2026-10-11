import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Download, Sparkles } from 'lucide-react';
import { KpiCard } from '../components/KpiCard';
import { API_BASE_URL, OPTIMAL_THRESHOLD } from '../constants';

export const BatchEvaluationPage = () => {
  const [batchData, setBatchData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [search, setSearch] = useState('');
  const [summaryStats, setSummaryStats] = useState(null);

  const generateSampleBatch = async () => {
    setLoading(true);
    const sampleApplicants = [
      { applicantName: 'Emma Watson', AMT_INCOME_TOTAL: 380000, AMT_CREDIT: 450000, AMT_ANNUITY: 23000, DAYS_BIRTH: -16000, DAYS_EMPLOYED: -3000, EXT_SOURCE_1: 0.78, EXT_SOURCE_2: 0.81, EXT_SOURCE_3: 0.75, NAME_CONTRACT_TYPE: 'Cash loans' },
      { applicantName: 'Liam Johnson', AMT_INCOME_TOTAL: 150000, AMT_CREDIT: 480000, AMT_ANNUITY: 25000, DAYS_BIRTH: -13000, DAYS_EMPLOYED: -1200, EXT_SOURCE_1: 0.45, EXT_SOURCE_2: 0.48, EXT_SOURCE_3: 0.50, NAME_CONTRACT_TYPE: 'Cash loans' },
      { applicantName: 'Noah Williams', AMT_INCOME_TOTAL: 75000, AMT_CREDIT: 600000, AMT_ANNUITY: 34000, DAYS_BIRTH: -8500, DAYS_EMPLOYED: -200, EXT_SOURCE_1: 0.14, EXT_SOURCE_2: 0.16, EXT_SOURCE_3: 0.12, NAME_CONTRACT_TYPE: 'Cash loans' },
      { applicantName: 'Olivia Brown', AMT_INCOME_TOTAL: 240000, AMT_CREDIT: 520000, AMT_ANNUITY: 27000, DAYS_BIRTH: -14500, DAYS_EMPLOYED: -2200, EXT_SOURCE_1: 0.65, EXT_SOURCE_2: 0.68, EXT_SOURCE_3: 0.62, NAME_CONTRACT_TYPE: 'Cash loans' },
      { applicantName: 'James Jones', AMT_INCOME_TOTAL: 110000, AMT_CREDIT: 550000, AMT_ANNUITY: 29000, DAYS_BIRTH: -10500, DAYS_EMPLOYED: -450, EXT_SOURCE_1: 0.28, EXT_SOURCE_2: 0.32, EXT_SOURCE_3: 0.30, NAME_CONTRACT_TYPE: 'Cash loans' },
      { applicantName: 'Sophia Garcia', AMT_INCOME_TOTAL: 420000, AMT_CREDIT: 500000, AMT_ANNUITY: 24000, DAYS_BIRTH: -17500, DAYS_EMPLOYED: -4100, EXT_SOURCE_1: 0.82, EXT_SOURCE_2: 0.85, EXT_SOURCE_3: 0.80, NAME_CONTRACT_TYPE: 'Cash loans' },
      { applicantName: 'Lucas Miller', AMT_INCOME_TOTAL: 95000, AMT_CREDIT: 580000, AMT_ANNUITY: 31000, DAYS_BIRTH: -9200, DAYS_EMPLOYED: -310, EXT_SOURCE_1: 0.18, EXT_SOURCE_2: 0.22, EXT_SOURCE_3: 0.19, NAME_CONTRACT_TYPE: 'Cash loans' },
      { applicantName: 'Ava Davis', AMT_INCOME_TOTAL: 190000, AMT_CREDIT: 490000, AMT_ANNUITY: 26000, DAYS_BIRTH: -12500, DAYS_EMPLOYED: -1600, EXT_SOURCE_1: 0.52, EXT_SOURCE_2: 0.55, EXT_SOURCE_3: 0.51, NAME_CONTRACT_TYPE: 'Cash loans' },
    ];

    try {
      const res = await axios.post(`${API_BASE_URL}/predictions/batch`, {
        applicants: sampleApplicants,
        threshold: OPTIMAL_THRESHOLD,
      });

      if (res.data && res.data.data) {
        const d = res.data.data;
        const results = d.results.map((r, i) => ({
          ...sampleApplicants[i],
          ...r,
        }));
        setBatchData(results);
        setSummaryStats({
          total: d.totalProcessed,
          approved: d.approvedCount,
          review: d.reviewCount,
          rejected: d.rejectedCount,
          avgRisk: (d.averageProbability * 100).toFixed(2),
        });
      }
    } catch (err) {
      console.error('Batch scoring API error:', err);
      alert('Batch scoring failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const rows = text.split('\n').filter((r) => r.trim() !== '');
        const headers = rows[0].split(',').map((h) => h.trim());
        
        const applicants = [];
        for (let i = 1; i < rows.length; i++) {
          const values = rows[i].split(',').map((v) => v.trim());
          const obj = {};
          headers.forEach((h, idx) => {
            const val = values[idx];
            obj[h] = isNaN(val) ? val : Number(val);
          });
          if (!obj.applicantName) {
            obj.applicantName = `CSV-Applicant-${i}`;
          }
          applicants.push(obj);
        }

        if (applicants.length > 0) {
          setLoading(true);
          const res = await axios.post(`${API_BASE_URL}/predictions/batch`, {
            applicants,
            threshold: OPTIMAL_THRESHOLD,
          });

          if (res.data && res.data.data) {
            const d = res.data.data;
            const results = d.results.map((r, i) => ({
              ...applicants[i],
              ...r,
            }));
            setBatchData(results);
            setSummaryStats({
              total: d.totalProcessed,
              approved: d.approvedCount,
              review: d.reviewCount,
              rejected: d.rejectedCount,
              avgRisk: (d.averageProbability * 100).toFixed(2),
            });
          }
        }
      } catch (err) {
        alert('Failed to parse and score CSV: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const exportResultsToCsv = () => {
    if (batchData.length === 0) return;
    const headers = ['Applicant', 'Income', 'Credit', 'Probability', 'Decision', 'RiskLevel'];
    const rows = batchData.map((r) => [
      r.applicantName,
      r.AMT_INCOME_TOTAL,
      r.AMT_CREDIT,
      (r.probability * 100).toFixed(2) + '%',
      r.decision,
      r.riskLevel,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `credit_risk_batch_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = batchData.filter((item) => {
    const matchesRisk = filterRisk === 'ALL' || item.riskLevel === filterRisk;
    const matchesSearch = !search || item.applicantName?.toLowerCase().includes(search.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  return (
    <div className="page-body">
      {/* Upload & Action Card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">
              Batch Loan Portfolio Assessment
            </h2>
            <div className="card-subtitle">
              Upload loan application batches or run high-throughput automated scoring
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary btn-sm" onClick={generateSampleBatch} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color="#0066FF" /> Generate & Score Sample Batch
            </button>
            {batchData.length > 0 && (
              <button className="btn btn-primary btn-sm" onClick={exportResultsToCsv} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Download size={14} /> Export Results CSV
              </button>
            )}
          </div>
        </div>

        {/* File Dropzone */}
        <div style={{
          border: '2px dashed #CBD5E1',
          borderRadius: '10px',
          padding: '32px 20px',
          textAlign: 'center',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: '#EFF6FF',
            color: '#0066FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '4px'
          }}>
            <Upload size={22} color="#0066FF" />
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
            Upload Loan Portfolio CSV File
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '520px' }}>
            Accepts CSV files with columns: <code>AMT_INCOME_TOTAL, AMT_CREDIT, AMT_ANNUITY, EXT_SOURCE_1, EXT_SOURCE_2, EXT_SOURCE_3</code>
          </div>

          <label className="btn btn-primary btn-sm" style={{ marginTop: '8px', cursor: 'pointer', padding: '8px 18px', borderRadius: '8px' }}>
            Browse CSV File
            <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* Summary KPI Cards when Batch Processed */}
      {summaryStats && (
        <div className="grid-4" style={{ marginBottom: '20px' }}>
          <KpiCard
            title="Total In Batch"
            value={summaryStats.total}
            subtitle="Applications processed"
            badge="Completed"
            badgeType="neutral"
          />
          <KpiCard
            title="Approved"
            value={summaryStats.approved}
            subtitle="Prob < 0.05"
            badge="Approved"
            badgeType="low"
          />
          <KpiCard
            title="Manual Review"
            value={summaryStats.review}
            subtitle="Prob 0.05 - 0.10"
            badge="Borderline"
            badgeType="medium"
          />
          <KpiCard
            title="Rejected (Default)"
            value={summaryStats.rejected}
            subtitle={`Avg Risk: ${summaryStats.avgRisk}%`}
            badge="High Risk"
            badgeType="high"
          />
        </div>
      )}

      {/* Batch Results Table */}
      {batchData.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Batch Assessment Results ({filteredData.length} records)</h3>
            </div>

            {/* Filter Bar */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search applicant name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '220px', padding: '6px 10px', fontSize: '13px' }}
              />

              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '13px' }}
              >
                <option value="ALL">All Risk Tiers</option>
                <option value="LOW">Low Risk (Approved)</option>
                <option value="MEDIUM">Moderate Risk (Review)</option>
                <option value="HIGH">High Risk (Rejected)</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Applicant Name</th>
                  <th>Income ($)</th>
                  <th>Credit Requested ($)</th>
                  <th>DTI Ratio</th>
                  <th>Default Probability</th>
                  <th>Decision</th>
                  <th>Risk Tier</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => {
                  const prob = (item.probability * 100).toFixed(2);
                  const isLow = item.riskLevel === 'LOW' || item.decision === 'APPROVED';
                  const isMed = item.riskLevel === 'MEDIUM' || item.decision === 'MANUAL_REVIEW';
                  const dti = (item.AMT_CREDIT / Math.max(item.AMT_INCOME_TOTAL, 1)).toFixed(1);

                  return (
                    <tr key={index}>
                      <td style={{ fontWeight: 600 }}>{item.applicantName}</td>
                      <td>${Number(item.AMT_INCOME_TOTAL).toLocaleString()}</td>
                      <td>${Number(item.AMT_CREDIT).toLocaleString()}</td>
                      <td>{dti}x</td>
                      <td style={{ fontWeight: 700, color: isLow ? '#059669' : isMed ? '#D97706' : '#DC2626' }}>
                        {prob}%
                      </td>
                      <td>
                        <span className={`badge ${isLow ? 'badge-low' : isMed ? 'badge-medium' : 'badge-high'}`}>
                          {item.decision}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', fontWeight: 600 }}>
                        {item.riskLevel}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
