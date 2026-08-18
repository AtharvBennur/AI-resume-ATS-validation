import { useState } from 'react';
import { analyzeJobPosting, enhanceResume, getResumes } from '../services/api';
import '../styles/pages.css';

function EnhanceResume() {
  const [step, setStep] = useState(1);
  const [selectedResume, setSelectedResume] = useState('');
  const [resumes, setResumes] = useState([]);
  const [jobUrl, setJobUrl] = useState('');
  const [jobAnalysis, setJobAnalysis] = useState(null);
  const [enhancement, setEnhancement] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResumeSelect = async (e) => {
    setSelectedResume(e.target.value);
  };

  const handleAnalyzeJob = async () => {
    if (!jobUrl) {
      alert('Please enter a job URL');
      return;
    }

    setIsLoading(true);
    try {
      const response = await analyzeJobPosting(jobUrl);
      if (response.success) {
        setJobAnalysis(response.analysis);
        setStep(3);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnhance = async () => {
    if (!selectedResume || !jobAnalysis) return;

    setIsLoading(true);
    try {
      const response = await enhanceResume(selectedResume, jobAnalysis);
      if (response.success) {
        setEnhancement(response.enhancement);
        setStep(4);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySuggestion = (suggestionIndex) => {
    alert('Suggestion applied! Redirecting to resume editor...');
    window.location.href = '/resume/create';
  };

  return (
    <div className="enhance-resume-page">
      <div className="container">
        <h1>Enhance Your Resume</h1>
        <p className="page-description">Tailor your resume to match a specific job posting</p>

        {step === 1 && (
          <div className="enhance-step">
            <h2>Step 1: Select Resume</h2>
            <select value={selectedResume} onChange={handleResumeSelect} className="input">
              <option value="">Choose a resume</option>
              <option value="1">Cloud Engineer Resume</option>
              <option value="2">Data Engineer Resume</option>
              <option value="3">Software Developer Resume</option>
            </select>
            {selectedResume && (
              <button onClick={() => setStep(2)} className="btn btn-primary btn-large">
                Continue
              </button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="enhance-step">
            <h2>Step 2: Job Posting</h2>
            <div className="form-group">
              <label>Job Posting URL</label>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://example.com/job/posting"
                className="input"
              />
              <p className="hint">Enter the URL of the job posting you want to tailor your resume for</p>
            </div>
            <button onClick={handleAnalyzeJob} className="btn btn-primary btn-large" disabled={isLoading}>
              {isLoading ? 'Analyzing...' : 'Analyze Job'}
            </button>
          </div>
        )}

        {step === 3 && jobAnalysis && (
          <div className="enhance-step">
            <h2>Step 3: Job Analysis</h2>
            <div className="analysis-card">
              <div className="analysis-header">
                <h3>{jobAnalysis.jobTitle}</h3>
                <p className="company">{jobAnalysis.company}</p>
              </div>

              <div className="analysis-section">
                <h4>Required Skills</h4>
                <div className="tags">
                  {jobAnalysis.requiredSkills.map((skill, idx) => (
                    <span key={idx} className="tag">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="analysis-section">
                <h4>Technologies</h4>
                <div className="tags">
                  {jobAnalysis.technologies.map((tech, idx) => (
                    <span key={idx} className="tag">{tech}</span>
                  ))}
                </div>
              </div>

              <div className="analysis-section">
                <h4>Key Keywords</h4>
                <div className="tags">
                  {jobAnalysis.keywords.map((kw, idx) => (
                    <span key={idx} className="tag">{kw}</span>
                  ))}
                </div>
              </div>

              <div className="analysis-section">
                <h4>Key Responsibilities</h4>
                <ul>
                  {jobAnalysis.responsibilities.map((resp, idx) => (
                    <li key={idx}>{resp}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button onClick={handleEnhance} className="btn btn-primary btn-large" disabled={isLoading}>
              {isLoading ? 'Enhancing...' : 'Enhance Resume'}
            </button>
          </div>
        )}

        {step === 4 && enhancement && (
          <div className="enhance-step">
            <h2>Step 4: Enhancement Results</h2>

            <div className="match-score">
              <div className="score-circle">{enhancement.matchScore}%</div>
              <div className="score-label">Resume Match Score</div>
            </div>

            <div className="enhancement-sections">
              <div className="enhancement-section">
                <h3>✓ Matched Skills</h3>
                <div className="tags">
                  {enhancement.matchedSkills.map((skill, idx) => (
                    <span key={idx} className="tag tag-success">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="enhancement-section">
                <h3>⚠ Missing Keywords</h3>
                <div className="tags">
                  {enhancement.missingKeywords.map((kw, idx) => (
                    <span key={idx} className="tag tag-warning">{kw}</span>
                  ))}
                </div>
              </div>

              <div className="enhancement-section">
                <h3>Suggested Improvements</h3>
                <div className="suggestions">
                  {enhancement.suggestions.map((sugg, idx) => (
                    <div key={idx} className={`suggestion suggestion-${sugg.priority}`}>
                      <div className="suggestion-type">{sugg.type}</div>
                      <div className="suggestion-text">{sugg.suggestion}</div>
                      <button onClick={() => handleApplySuggestion(idx)} className="btn-small btn-primary">
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EnhanceResume;
