import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getResumes } from '../services/api';
import '../styles/pages.css';

function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [stats, setStats] = useState({
    totalResumes: 0,
    atsChecks: 0,
    avgATSScore: 0,
    jobMatches: 0
  });

  useEffect(() => {
    const fetchResumes = async () => {
      const response = await getResumes();
      if (response.success) {
        setResumes(response.resumes);
        const avgScore = response.resumes.length > 0
          ? Math.round(response.resumes.reduce((sum, r) => sum + r.atsScore, 0) / response.resumes.length)
          : 0;
        setStats({
          totalResumes: response.resumes.length,
          atsChecks: response.resumes.length,
          avgATSScore: avgScore,
          jobMatches: 3
        });
      }
    };
    fetchResumes();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {localStorage.getItem('userName')}</h1>
          <p>Manage your resumes and improve your job applications.</p>
        </div>

        {/* Stats Section */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.totalResumes}</div>
            <div className="stat-label">Total Resumes</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.atsChecks}</div>
            <div className="stat-label">ATS Checks</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.avgATSScore}%</div>
            <div className="stat-label">Average ATS Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.jobMatches}</div>
            <div className="stat-label">Job Matches</div>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/resume/create" className="action-card">
              <div className="action-icon">✨</div>
              <h3>Create Resume</h3>
              <p>Start building a new resume</p>
            </Link>
            <Link to="/resume/update" className="action-card">
              <div className="action-icon">📝</div>
              <h3>Update Resume</h3>
              <p>Convert existing resume</p>
            </Link>
            <Link to="/resume/enhance" className="action-card">
              <div className="action-icon">⚡</div>
              <h3>Enhance Resume</h3>
              <p>Tailor for job posting</p>
            </Link>
            <Link to="/ats" className="action-card">
              <div className="action-icon">✓</div>
              <h3>ATS Validation</h3>
              <p>Check your ATS score</p>
            </Link>
          </div>
        </section>

        {/* Recent Resumes */}
        <section className="recent-resumes">
          <h2>Recent Resumes</h2>
          {resumes.length > 0 ? (
            <div className="resumes-table">
              <div className="table-header">
                <div className="col-name">Resume Name</div>
                <div className="col-date">Last Updated</div>
                <div className="col-score">ATS Score</div>
                <div className="col-actions">Actions</div>
              </div>
              {resumes.map(resume => (
                <div key={resume.id} className="table-row">
                  <div className="col-name">{resume.name}</div>
                  <div className="col-date">{resume.lastUpdated}</div>
                  <div className="col-score">
                    <span className="badge badge-success">{resume.atsScore}%</span>
                  </div>
                  <div className="col-actions">
                    <Link to={`/resume/${resume.id}/edit`} className="link-btn">Edit</Link>
                    <Link to={`/resume/${resume.id}/preview`} className="link-btn">Preview</Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No resumes yet. <Link to="/resume/create">Create your first resume</Link></p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
