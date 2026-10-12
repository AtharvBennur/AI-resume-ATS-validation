import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResumes, validateATS } from '../services/api';
import '../styles/pages.css';

function ATSValidation() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [resumeId, setResumeId] = useState('');
  const [resumes, setResumes] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    getResumes()
      .then((response) => {
        if (isCurrent && response.success) setResumes(response.resumes);
      })
      .catch(() => {
        if (isCurrent) setResumes([]);
      });
    return () => { isCurrent = false; };
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    const supportedType = file.type === 'application/pdf'
      || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      || /\.(pdf|docx)$/i.test(file.name);
    if (file.size > 5 * 1024 * 1024) {
      setActionError('Resume files must be 5 MB or smaller.');
    } else if (supportedType) {
      setActionError('');
      setUploadedFile(file);
      setStep(2);
    } else {
      setActionError('Please select a PDF or DOCX file.');
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;
    setIsLoading(true);
    setActionError('');
    try {
      const response = await validateATS(uploadedFile, jobDescription, resumeId);
      if (response.success) {
        setReport(response.report);
        setStep(3);
      }
    } catch (error) {
      setActionError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ats-validation-page">
      <div className="container">
        <div className="ats-header">
          <h1>Check Your Resume ATS Score</h1>
          <p>Scores are calculated from extracted text, resume sections, contact details, and optional job keywords.</p>
        </div>
        {actionError && <p className="builder-error" role="alert">{actionError}</p>}

        {step === 1 && (
          <div className="ats-step">
            <div
              className={`upload-box ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="upload-icon">📤</div>
              <h3>Drag and drop your resume here</h3>
              <p>or</p>
              <label className="btn btn-primary">
                Choose File
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  style={{ display: 'none' }}
                />
              </label>
              <p className="upload-hint">Supported: PDF, DOCX</p>
            </div>
          </div>
        )}

        {step === 2 && uploadedFile && (
          <div className="ats-step">
            <div className="file-info">
              <div className="file-details">
                <div className="file-name">📄 {uploadedFile.name}</div>
                <div className="file-size">{(uploadedFile.size / 1024).toFixed(2)} KB</div>
              </div>
              <button onClick={() => { setUploadedFile(null); setStep(1); }} className="btn-remove">Remove</button>
            </div>

            <div className="form-group">
              <label htmlFor="job-description">Job description (optional)</label>
              <textarea
                id="job-description"
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Paste a job description to check matching keywords"
                rows="5"
              />
            </div>

            <div className="form-group">
              <label htmlFor="resume-to-update">Update a saved resume score (optional)</label>
              <select id="resume-to-update" value={resumeId} onChange={(event) => setResumeId(event.target.value)}>
                <option value="">Keep this report separate</option>
                {resumes.map((resume) => <option key={resume.id} value={resume.id}>{resume.name}</option>)}
              </select>
            </div>
            
            <div className="analysis-progress">
              <div className="progress-title">Analyzing Resume...</div>
              <div className="progress-steps">
                <div className="progress-step">Extracting Resume Content</div>
                <div className="progress-step">Checking Keywords</div>
                <div className="progress-step">Checking Structure</div>
                <div className="progress-step">Checking Formatting</div>
                <div className="progress-step">Generating Report</div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>

            <button onClick={handleAnalyze} className="btn btn-primary btn-large" disabled={isLoading}>
              {isLoading ? 'Analyzing...' : 'Analyze Resume'}
            </button>
          </div>
        )}

        {step === 3 && report && (
          <div className="ats-result">
            <div className="ats-score-section">
              <div className="score-display">
                <div className="score-number">{report.score}</div>
                <div className="score-max">/ 100</div>
              </div>
              <div className="score-status">{report.status}</div>
            </div>

            <div className="score-breakdown">
              {[
                ['contactDetails', 'Contact Details'],
                ['structure', 'Section Structure'],
                ['readability', 'Readability'],
                ['contentQuality', 'Content Quality'],
                ['keywordMatch', 'Job Keyword Match']
              ].map(([key, label]) => {
                const value = report.breakdown[key];
                return (
                  <div key={key} className="breakdown-item">
                    <div className="breakdown-label">{label}</div>
                    {value === null ? (
                      <div className="breakdown-value">Not scored</div>
                    ) : (
                      <>
                        <div className="breakdown-bar">
                          <div className="breakdown-fill" style={{ width: `${value}%` }}></div>
                        </div>
                        <div className="breakdown-value">{value}%</div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="step-description">Heuristic feedback only; applicant tracking systems use different criteria.</p>

            <div className="ats-suggestions">
              {report.good.length > 0 && (
                <div className="suggestions-section suggestions-good">
                  <h3>✓ Good</h3>
                  <ul>
                    {report.good.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {report.warnings.length > 0 && (
                <div className="suggestions-section suggestions-warning">
                  <h3>⚠ Warnings</h3>
                  <ul>
                    {report.warnings.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {report.critical.length > 0 && (
                <div className="suggestions-section suggestions-critical">
                  <h3>✕ Critical</h3>
                  <ul>
                    {report.critical.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button onClick={() => navigate('/resume/enhance')} className="btn btn-primary btn-large">
              Improve Resume
            </button>
            {report.id && (
              <button type="button" onClick={() => navigate(`/ats/${report.id}`)} className="btn btn-secondary btn-large">
                Open saved report
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ATSValidation;
