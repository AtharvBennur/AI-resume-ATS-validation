import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteResume, getResumes } from '../services/api';
import '../styles/pages.css';

const formatDate = (value) => {
  if (!value) return 'Not updated';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('recent');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    getResumes()
      .then((response) => {
        if (isCurrent) setResumes(response.resumes || []);
      })
      .catch((error) => {
        if (isCurrent) setLoadError(error.message);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const handleDelete = async (resume) => {
    if (!window.confirm(`Delete "${resume.name || 'Untitled resume'}"? This cannot be undone.`)) return;
    setActionError('');
    try {
      await deleteResume(resume.id);
      setResumes((currentResumes) => currentResumes.filter((item) => item.id !== resume.id));
    } catch (error) {
      setActionError(error.message);
    }
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredResumes = resumes
    .filter((resume) => (resume.name || '').toLowerCase().includes(normalizedSearch))
    .sort((first, second) => {
      if (sortOrder === 'score') return Number(second.atsScore || 0) - Number(first.atsScore || 0);
      return new Date(second.lastUpdated || 0).getTime() - new Date(first.lastUpdated || 0).getTime();
    });

  return (
    <div className="workspace-page">
      <div className="workspace-container">
        <header className="workspace-page-heading workspace-page-heading-row">
          <div>
            <span className="workspace-eyebrow">YOUR DOCUMENTS</span>
            <h1>My resumes</h1>
            <p>Keep every version organized and ready for your next opportunity.</p>
          </div>
          <Link to="/resume/create" className="workspace-button workspace-button-primary">Create a resume <span aria-hidden="true">+</span></Link>
        </header>

        <div className="resumes-toolbar">
          <label className="resumes-search">
            <span className="visually-hidden">Search resumes</span>
            <span className="resumes-search-icon" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search by resume name"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
          <label className="resumes-sort">
            <span>Sort by</span>
            <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
              <option value="recent">Recently updated</option>
              <option value="score">Highest ATS score</option>
            </select>
          </label>
          <span className="resumes-count">{filteredResumes.length} {filteredResumes.length === 1 ? 'resume' : 'resumes'}</span>
        </div>

        {actionError && <p className="workspace-message workspace-message-error" role="alert">{actionError}</p>}

        {isLoading ? (
          <p className="workspace-state">Loading your resumes...</p>
        ) : loadError ? (
          <div className="workspace-empty-state">
            <span className="workspace-eyebrow">LIBRARY UNAVAILABLE</span>
            <h2>We couldn't load your resumes.</h2>
            <p role="alert">{loadError}</p>
            <button type="button" className="workspace-button workspace-button-secondary" onClick={() => window.location.reload()}>Try again</button>
          </div>
        ) : filteredResumes.length ? (
          <section className="resumes-list" aria-label="Your resumes">
            {filteredResumes.map((resume, index) => (
              <article key={resume.id} className="resume-library-row">
                <div className="resume-paper-icon" aria-hidden="true"><span /><span /><span /></div>
                <div className="resume-library-details">
                  <span className="resume-library-index">DOCUMENT {String(index + 1).padStart(2, '0')}</span>
                  <h2>{resume.name || 'Untitled resume'}</h2>
                  <p>Updated {formatDate(resume.lastUpdated)}</p>
                </div>
                <div className="resume-library-score">
                  <span>ATS SCORE</span>
                  {Number(resume.atsScore) > 0
                    ? <strong>{resume.atsScore}<small>%</small></strong>
                    : <em>Not checked</em>}
                </div>
                <div className="resume-library-actions">
                  <Link to={`/resume/${resume.id}/edit`} className="resume-action-link">Edit</Link>
                  <Link to={`/resume/${resume.id}/preview`} className="resume-action-link">Preview</Link>
                  <button type="button" className="resume-action-delete" onClick={() => handleDelete(resume)}>Delete</button>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="workspace-empty-state">
            <span className="workspace-eyebrow">{resumes.length ? 'NO MATCHES' : 'YOUR LIBRARY'}</span>
            <h2>{resumes.length ? 'No resumes match that search.' : 'Your next opportunity starts here.'}</h2>
            <p>{resumes.length ? 'Try a different name or clear your search.' : 'Create a resume to keep your experience organized in one place.'}</p>
            {resumes.length
              ? <button type="button" className="workspace-button workspace-button-secondary" onClick={() => setSearchTerm('')}>Clear search</button>
              : <Link to="/resume/create" className="workspace-button workspace-button-primary">Create your first resume</Link>}
          </div>
        )}
      </div>
    </div>
  );
}

export default Resumes;
