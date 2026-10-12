import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractResumeData, getResumes } from '../services/api';
import '../styles/pages.css';

function UpdateResume() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [extractedSections, setExtractedSections] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [targetResumeId, setTargetResumeId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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
      const response = await extractResumeData(uploadedFile);
      if (response.success) {
        setExtractedData(response.extractedData);
        setExtractedSections(response.extractedSections);
        setStep(3);
      }
    } catch (error) {
      setActionError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvert = () => {
    if (extractedData) {
      localStorage.removeItem('currentResume');
      navigate(targetResumeId ? `/resume/${targetResumeId}/edit` : '/resume/create', {
        state: { importedResume: extractedData, targetResumeId }
      });
    }
  };

  return (
    <div className="update-resume-page">
      <div className="container">
        <h1>Update Resume</h1>
        <p className="page-description">Convert your existing resume to our format</p>
        {actionError && <p className="builder-error" role="alert">{actionError}</p>}

        {step === 1 && (
          <div className="update-step">
            <h2>Step 1: Upload Your Resume</h2>
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
          <div className="update-step">
            <h2>Step 2: Verify Upload</h2>
            <div className="file-info">
              <div className="file-details">
                <div className="file-name">📄 {uploadedFile.name}</div>
                <div className="file-size">{(uploadedFile.size / 1024).toFixed(2)} KB</div>
              </div>
              <button onClick={() => { setUploadedFile(null); setStep(1); }} className="btn-remove">Remove</button>
            </div>
            <button onClick={handleAnalyze} className="btn btn-primary btn-large" disabled={isLoading}>
              {isLoading ? 'Extracting...' : 'Analyze Resume'}
            </button>
          </div>
        )}

        {step === 3 && extractedSections && (
          <div className="update-step">
            <h2>Step 3: Extracted Sections</h2>
            <p className="step-description">Your resume has been analyzed. Here's what was extracted:</p>
            <div className="extraction-results">
              {Object.entries(extractedSections).map(([key, extracted]) => (
                <div key={key} className="extraction-item">
                  <span className="item-name">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className={`item-status ${extracted ? 'success' : 'pending'}`}>
                    {extracted ? '✓' : '○'}
                  </span>
                </div>
              ))}
            </div>
            <div className="form-group import-target">
              <label htmlFor="import-target">Import into</label>
              <select id="import-target" value={targetResumeId} onChange={(event) => setTargetResumeId(event.target.value)}>
                <option value="">Create a new resume</option>
                {resumes.map((resume) => <option key={resume.id} value={resume.id}>Replace {resume.name}</option>)}
              </select>
            </div>
            <button onClick={handleConvert} className="btn btn-primary btn-large">
              {targetResumeId ? 'Edit selected resume with imported data' : 'Create resume from imported data'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UpdateResume;
