import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getATSReport } from '../services/api';
import '../styles/pages.css';

function ATSReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    const loadReport = async () => {
      try {
        const response = await getATSReport(id);
        if (isCurrent && response.success) setReport(response.report);
      } catch (error) {
        if (isCurrent) setLoadError(error.message);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };
    loadReport();
    return () => { isCurrent = false; };
  }, [id]);

  if (isLoading) return <div className="container"><p>Loading report...</p></div>;
  if (!report) {
    return (
      <div className="container">
        <p role="alert">{loadError || 'ATS report not found'}</p>
        <button type="button" onClick={() => navigate('/ats')} className="btn btn-secondary">Back to ATS validation</button>
      </div>
    );
  }

  const breakdown = report.breakdown || {};
  const breakdownItems = [
    ['contactDetails', 'Contact Details'],
    ['structure', 'Section Structure'],
    ['readability', 'Readability'],
    ['contentQuality', 'Content Quality'],
    ['keywordMatch', 'Job Keyword Match']
  ];
  const good = report.good || [];
  const warnings = report.warnings || [];
  const critical = report.critical || [];

  const handleDownload = () => {
    const sections = [
      'ATS VALIDATION REPORT',
      `Resume: ${report.resumeName}`,
      ...(report.jobPostingUrl ? [`Job posting: ${report.jobPostingUrl}`] : []),
      `Date: ${report.date}`,
      `Score: ${report.score}/100 (${report.status})`,
      '',
      'SCORE BREAKDOWN',
      ...breakdownItems.map(([key, label]) => `${label}: ${breakdown[key] ?? 'Not scored'}${breakdown[key] === null || breakdown[key] === undefined ? '' : '%'}`),
      '',
      'WHAT IS WORKING',
      ...(good.length ? good.map((item) => `- ${item}`) : ['- None recorded']),
      '',
      'AREAS TO REVIEW',
      ...(warnings.length ? warnings.map((item) => `- ${item}`) : ['- None recorded']),
      '',
      'CRITICAL ISSUES',
      ...(critical.length ? critical.map((item) => `- ${item}`) : ['- None recorded'])
    ].join('\n');
    const url = URL.createObjectURL(new Blob([sections], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `ats-report-${report.id || id}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

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
            {report.jobPostingUrl && (
              <div className="meta-item">
                <span className="label">Job posting:</span>
                <a className="value" href={report.jobPostingUrl} target="_blank" rel="noreferrer">View listing</a>
              </div>
            )}
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
            {breakdownItems.map(([key, label]) => {
              const value = breakdown[key];
              return (
                <div className="breakdown-card" key={key}>
                  <div className="breakdown-title">{label}</div>
                  {value === null || value === undefined ? (
                    <div className="breakdown-value">Not scored</div>
                  ) : (
                    <>
                      <div className="breakdown-bar-large">
                        <div className="breakdown-fill" style={{ width: `${value}%` }}></div>
                      </div>
                      <div className="breakdown-value">{value}%</div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="report-section">
          <h2>Detailed Analysis</h2>
          
          {good.length > 0 && (
            <div className="analysis-subsection good">
              <h3>✓ What's Working Well</h3>
              <ul>
                {good.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {warnings.length > 0 && (
            <div className="analysis-subsection warning">
              <h3>⚠ Areas for Improvement</h3>
              <ul>
                {warnings.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {critical.length > 0 && (
            <div className="analysis-subsection critical">
              <h3>✕ Critical Issues</h3>
              <ul>
                {critical.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="report-actions">
          <button type="button" onClick={() => navigate('/ats')} className="btn btn-secondary">← Back</button>
          <button type="button" onClick={handleDownload} className="btn btn-primary">Download Report</button>
          <button type="button" onClick={() => navigate('/resume/create')} className="btn btn-primary">Improve Resume</button>
        </div>
      </div>
    </div>
  );
}

export default ATSReport;
