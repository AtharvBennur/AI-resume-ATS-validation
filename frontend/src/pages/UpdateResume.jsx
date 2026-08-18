import { useState } from 'react';
import { extractResumeData } from '../services/api';
import '../styles/pages.css';

function UpdateResume() {
  const [step, setStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [extractedSections, setExtractedSections] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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
      const response = await extractResumeData(uploadedFile);
      if (response.success) {
        setExtractedData(response.extractedData);
        setExtractedSections(response.extractedSections);
        setStep(3);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvert = () => {
    if (extractedData) {
      localStorage.setItem('currentResume', JSON.stringify({
        personalInfo: extractedData.personalInfo,
        professionalSummary: extractedData.professionalSummary,
        education: extractedData.education,
        skills: extractedData.skills,
        experience: extractedData.experience,
        projects: extractedData.projects,
        certifications: extractedData.certifications,
        achievements: extractedData.achievements
      }));
      window.location.href = '/resume/create';
    }
  };

  return (
    <div className="update-resume-page">
      <div className="container">
        <h1>Update Resume</h1>
        <p className="page-description">Convert your existing resume to our format</p>

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
              <button onClick={() => setUploadedFile(null)} className="btn-remove">Remove</button>
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
            <button onClick={handleConvert} className="btn btn-primary btn-large">
              Convert to Resume Format
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UpdateResume;
