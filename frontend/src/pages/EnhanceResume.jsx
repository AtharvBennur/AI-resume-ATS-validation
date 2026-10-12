import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResumes, matchResumeToJob } from '../services/api';
import '../styles/pages.css';

function EnhanceResume() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedResume, setSelectedResume] = useState('');
  const [resumes, setResumes] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [enhancement, setEnhancement] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    getResumes()
      .then((response) => {
        if (isCurrent && response.success) setResumes(response.resumes);
      })
      .catch((error) => {
        if (isCurrent) setActionError(error.message);
      });
    return () => { isCurrent = false; };
  }, []);

  const handleResumeSelect = (e) => {
    setSelectedResume(e.target.value);
  };

  const handleAnalyzeJob = async () => {
    if (jobDescription.trim().length < 20) {
      setActionError('Paste a job description with at least 20 characters.');
      return;
    }

    setIsLoading(true);
    setActionError('');
    try {
      const response = await matchResumeToJob(selectedResume, jobDescription);
      if (response.success) {
        setEnhancement({
          matchScore: response.score,
          matchedSkills: response.matchedKeywords,
          missingKeywords: response.missingKeywords,
          suggestions: response.missingKeywords.map((keyword) => ({
            type: 'Keyword gap',
            priority: 'medium',
            suggestion: `Only if accurate, reflect ${keyword} in the relevant resume section.`
          }))
        });
        setStep(3);
      }
    } catch (error) {
      setActionError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySuggestion = () => {
    navigate(`/resume/${selectedResume}/edit`);
  };

  return (
    <div className="enhance-resume-page">
      <div className="container">
        <h1>Enhance Your Resume</h1>
        <p className="page-description">Compare a saved resume with a job description using actual keyword overlap.</p>
        {actionError && <p className="builder-error" role="alert">{actionError}</p>}

        {step === 1 && (
          <div className="enhance-step">
            <h2>Step 1: Select Resume</h2>
            <select value={selectedResume} onChange={handleResumeSelect} className="input">
              <option value="">Choose a resume</option>
              {resumes.map((resume) => <option key={resume.id} value={resume.id}>{resume.name}</option>)}
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
            <h2>Step 2: Job Description</h2>
            <div className="form-group">
              <label htmlFor="job-description">Paste the job description</label>
              <textarea
                id="job-description"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job responsibilities and requirements"
                rows="8"
              />
            </div>
            <button onClick={handleAnalyzeJob} className="btn btn-primary btn-large" disabled={isLoading || !selectedResume}>
              {isLoading ? 'Comparing...' : 'Compare Resume'}
            </button>
          </div>
        )}

        {step === 3 && enhancement && (
          <div className="enhance-step">
            <h2>Actual Job Match</h2>

            <div className="match-score">
              <div className="score-circle">{enhancement.matchScore}%</div>
              <div className="score-label">Job Keyword Overlap</div>
            </div>
            <p className="step-description">This is a literal keyword overlap score, not a score from a specific employer's ATS.</p>

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
                  {enhancement.suggestions.length ? enhancement.suggestions.map((sugg, idx) => (
                    <div key={idx} className={`suggestion suggestion-${sugg.priority}`}>
                      <div className="suggestion-type">{sugg.type}</div>
                      <div className="suggestion-text">{sugg.suggestion}</div>
                      <button onClick={handleApplySuggestion} className="btn-small btn-primary">
                        Edit resume
                      </button>
                    </div>
                  )) : <p>No missing job-description keywords were found in this resume.</p>}
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
