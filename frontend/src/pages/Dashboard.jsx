import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getResumes } from '../services/api';
import '../styles/pages.css';

const formatDate = (value) => {
  if (!value) return 'Not updated yet';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    const fetchResumes = async () => {
      try {
        const response = await getResumes();
        if (isCurrent && response.success) setResumes(response.resumes);
      } catch (error) {
        if (isCurrent) setLoadError(error.message);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };
    fetchResumes();
    return () => { isCurrent = false; };
  }, []);

  const scoredResumes = resumes.filter((resume) => Number(resume.atsScore) > 0);
  const averageScore = scoredResumes.length
    ? Math.round(scoredResumes.reduce((sum, resume) => sum + Number(resume.atsScore), 0) / scoredResumes.length)
    : null;
  const latestResume = resumes[0];
  const firstName = localStorage.getItem('userName')?.trim().split(/\s+/)[0] || 'there';

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <header className="dashboard-hero">
          <div className="dashboard-welcome">
            <span className="dashboard-eyebrow">YOUR CAREER WORKSPACE</span>
            <h1>Good to see you, {firstName}.</h1>
            <p>Keep your experience sharp, your applications focused, and your next move ready.</p>
            <div className="dashboard-hero-actions">
              <Link to="/resume/create" className="dashboard-primary-link">Create a resume <span aria-hidden="true">↗</span></Link>
              <Link to="/ats" className="dashboard-secondary-link">Check ATS fit</Link>
            </div>
          </div>
        </header>

        <section className="dashboard-metrics" aria-label="Resume overview">
          <div className="dashboard-metric">
            <span>RESUMES</span>
            <strong>{isLoading ? '—' : resumes.length}</strong>
            <small>Saved in your library</small>
          </div>
          <div className="dashboard-metric">
            <span>AVERAGE ATS</span>
            <strong>{isLoading || averageScore === null ? '—' : `${averageScore}%`}</strong>
            <small>{scoredResumes.length ? `Across ${scoredResumes.length} scored resumes` : 'Run a check to see a score'}</small>
          </div>
          <div className="dashboard-metric">
            <span>LATEST UPDATE</span>
            <strong className="dashboard-metric-date">{isLoading ? '—' : formatDate(latestResume?.lastUpdated)}</strong>
            <small>{latestResume?.name || 'Your first resume is one step away'}</small>
          </div>
        </section>

        {loadError && <p className="dashboard-error" role="alert">{loadError}</p>}

        <div className="dashboard-workspace-grid">
          <section className="dashboard-library">
            <div className="dashboard-section-heading">
              <div>
                <span className="dashboard-eyebrow">YOUR DOCUMENTS</span>
                <h2>Recent resumes</h2>
              </div>
              <Link to="/resumes">View library <span aria-hidden="true">↗</span></Link>
            </div>
            {isLoading ? (
              <p className="dashboard-state">Loading resumes…</p>
            ) : resumes.length ? (
              <div className="dashboard-resume-list">
                {resumes.slice(0, 5).map((resume, index) => (
                  <article className="dashboard-resume-row" key={resume.id}>
                    <span className="dashboard-resume-index">{String(index + 1).padStart(2, '0')}</span>
                    <div className="dashboard-resume-copy">
                      <Link to={`/resume/${resume.id}/edit`}>{resume.name || 'Untitled resume'}</Link>
                      <span>{formatDate(resume.lastUpdated)}</span>
                    </div>
                    <span className={`dashboard-score${Number(resume.atsScore) > 0 ? ' has-score' : ''}`}>
                      {Number(resume.atsScore) > 0 ? `${resume.atsScore}% ATS` : 'Not scored'}
                    </span>
                    <Link to={`/resume/${resume.id}/edit`} className="dashboard-row-action" aria-label={`Edit ${resume.name || 'resume'}`}>Edit <span aria-hidden="true">→</span></Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="dashboard-empty">
                <span className="dashboard-empty-index">01</span>
                <div>
                  <h3>Your resume library is ready.</h3>
                  <p>Create a resume from scratch or bring in an existing document.</p>
                  <Link to="/resume/create" className="dashboard-primary-link">Start a resume <span aria-hidden="true">↗</span></Link>
                </div>
              </div>
            )}
          </section>

          <aside className="dashboard-toolbox">
            <span className="dashboard-eyebrow">MOVE YOUR WORK FORWARD</span>
            <h2>Quick actions</h2>
            <Link to="/resume/create" className="dashboard-tool-link">
              <span className="dashboard-tool-number">01</span>
              <span><strong>Build a resume</strong><small>Start with your experience</small></span>
              <span className="dashboard-tool-arrow" aria-hidden="true">↗</span>
            </Link>
            <Link to="/ats" className="dashboard-tool-link">
              <span className="dashboard-tool-number">02</span>
              <span><strong>Check ATS fit</strong><small>Review structure and keywords</small></span>
              <span className="dashboard-tool-arrow" aria-hidden="true">↗</span>
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
