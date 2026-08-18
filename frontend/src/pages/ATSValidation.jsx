import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateATS } from '../services/api';
import '../styles/pages.css';

function ATSValidation() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState(null);

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
    if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setUploadedFile(file);
      setStep(2);
    } else {
      alert('Please select a PDF or DOCX file');
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;
    
    setIsLoading(true);
    try {
      const response = await validateATS(uploadedFile);
      if (response.success) {
        setReport(response.report);
        setStep(3);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ats-validation-page">
      <div className="container">
        <div className="ats-header">
          <h1>Check Your Resume ATS Score</h1>
          <p>Upload your resume and identify areas that can be improved before applying.</p>
        </div>

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
              <button onClick={() => setUploadedFile(null)} className="btn-remove">Remove</button>
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
              <div className="breakdown-item">
                <div className="breakdown-label">Keyword Match</div>
                <div className="breakdown-bar">
                  <div className="breakdown-fill" style={{ width: `${report.breakdown.keywordMatch}%` }}></div>
                </div>
                <div className="breakdown-value">{report.breakdown.keywordMatch}%</div>
              </div>
              <div className="breakdown-item">
                <div className="breakdown-label">Formatting</div>
                <div className="breakdown-bar">
                  <div className="breakdown-fill" style={{ width: `${report.breakdown.formatting}%` }}></div>
                </div>
                <div className="breakdown-value">{report.breakdown.formatting}%</div>
              </div>
              <div className="breakdown-item">
                <div className="breakdown-label">Structure</div>
                <div className="breakdown-bar">
                  <div className="breakdown-fill" style={{ width: `${report.breakdown.structure}%` }}></div>
                </div>
                <div className="breakdown-value">{report.breakdown.structure}%</div>
              </div>
              <div className="breakdown-item">
                <div className="breakdown-label">Readability</div>
                <div className="breakdown-bar">
                  <div className="breakdown-fill" style={{ width: `${report.breakdown.readability}%` }}></div>
                </div>
                <div className="breakdown-value">{report.breakdown.readability}%</div>
              </div>
              <div className="breakdown-item">
                <div className="breakdown-label">Job Match</div>
                <div className="breakdown-bar">
                  <div className="breakdown-fill" style={{ width: `${report.breakdown.jobMatch}%` }}></div>
                </div>
                <div className="breakdown-value">{report.breakdown.jobMatch}%</div>
              </div>
            </div>

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
          </div>
        )}
      </div>
    </div>
  );
}

export default ATSValidation;
