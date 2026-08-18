import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getATSReport } from '../services/api';
import '../styles/pages.css';

function ATSReport() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      const response = await getATSReport(id);
      if (response.success) {
        setReport(response.report);
      }
      setIsLoading(false);
    };
    loadReport();
  }, [id]);

  if (isLoading) return <div className="container"><p>Loading report...</p></div>;
  if (!report) return <div className="container"><p>Report not found</p></div>;

  return (
    <div className="ats-report-page">
      <div className="container">
        <div className="report-header">
          <h1>ATS Validation Report</h1>
          <div className="report-meta">
            <div className="meta-item">
              <span className="label">Resume:</span>
              <span className="value">{report.resumeName}</span>
            </div>
            <div className="meta-item">
              <span className="label">Date:</span>
              <span className="value">{report.date}</span>
            </div>
          </div>
        </div>

        <div className="report-score">
          <div className="score-display-large">
            <div className="score-number">{report.score}</div>
            <div className="score-max">/ 100</div>
          </div>
          <div className="score-status-large">{report.status}</div>
        </div>

        <div className="report-section">
          <h2>Score Breakdown</h2>
          <div className="breakdown-grid">
            <div className="breakdown-card">
              <div className="breakdown-title">Keyword Match</div>
              <div className="breakdown-bar-large">
                <div className="breakdown-fill" style={{ width: `${report.breakdown.keywordMatch}%` }}></div>
              </div>
              <div className="breakdown-value">{report.breakdown.keywordMatch}%</div>
            </div>
            <div className="breakdown-card">
              <div className="breakdown-title">Formatting</div>
              <div className="breakdown-bar-large">
                <div className="breakdown-fill" style={{ width: `${report.breakdown.formatting}%` }}></div>
              </div>
              <div className="breakdown-value">{report.breakdown.formatting}%</div>
            </div>
            <div className="breakdown-card">
              <div className="breakdown-title">Structure</div>
              <div className="breakdown-bar-large">
                <div className="breakdown-fill" style={{ width: `${report.breakdown.structure}%` }}></div>
              </div>
              <div className="breakdown-value">{report.breakdown.structure}%</div>
            </div>
            <div className="breakdown-card">
              <div className="breakdown-title">Readability</div>
              <div className="breakdown-bar-large">
                <div className="breakdown-fill" style={{ width: `${report.breakdown.readability}%` }}></div>
              </div>
              <div className="breakdown-value">{report.breakdown.readability}%</div>
            </div>
            <div className="breakdown-card">
              <div className="breakdown-title">Job Match</div>
              <div className="breakdown-bar-large">
                <div className="breakdown-fill" style={{ width: `${report.breakdown.jobMatch}%` }}></div>
              </div>
              <div className="breakdown-value">{report.breakdown.jobMatch}%</div>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h2>Detailed Analysis</h2>
          
          {report.good.length > 0 && (
            <div className="analysis-subsection good">
              <h3>✓ What's Working Well</h3>
              <ul>
                {report.good.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {report.warnings.length > 0 && (
            <div className="analysis-subsection warning">
              <h3>⚠ Areas for Improvement</h3>
              <ul>
                {report.warnings.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {report.critical.length > 0 && (
            <div className="analysis-subsection critical">
              <h3>✕ Critical Issues</h3>
              <ul>
                {report.critical.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="report-actions">
          <button className="btn btn-secondary">← Back</button>
          <button className="btn btn-primary">Download Report</button>
          <button className="btn btn-primary">Improve Resume</button>
        </div>
      </div>
    </div>
  );
}

export default ATSReport;
