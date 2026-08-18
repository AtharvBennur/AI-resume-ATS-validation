import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getResumes, deleteResume } from '../services/api';
import '../styles/pages.css';

function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    const response = await getResumes();
    if (response.success) {
      setResumes(response.resumes);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      await deleteResume(id);
      setResumes(resumes.filter(r => r.id !== id));
    }
  };

  const filteredResumes = resumes.filter(resume => {
    const matchesSearch = resume.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'recent') return matchesSearch;
    if (filterType === 'highest') return matchesSearch;
    return matchesSearch;
  });

  if (isLoading) return <div className="container"><p>Loading resumes...</p></div>;

  return (
    <div className="resumes-page">
      <div className="container">
        <h1>My Resumes</h1>

        <div className="resumes-controls">
          <input
            type="text"
            placeholder="Search resumes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
          />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input">
            <option value="all">All Resumes</option>
            <option value="recent">Recently Updated</option>
            <option value="highest">Highest ATS</option>
          </select>
        </div>

        {filteredResumes.length > 0 ? (
          <div className="resumes-grid">
            {filteredResumes.map(resume => (
              <div key={resume.id} className="resume-card">
                <div className="card-header">
                  <h3>{resume.name}</h3>
                  <span className="badge badge-success">{resume.atsScore}%</span>
                </div>
                <div className="card-meta">
                  <span>Updated: {resume.lastUpdated}</span>
                </div>
                <div className="card-actions">
                  <Link to={`/resume/${resume.id}/edit`} className="btn-small btn-primary">Edit</Link>
                  <Link to={`/resume/${resume.id}/preview`} className="btn-small btn-secondary">Preview</Link>
                  <button onClick={() => handleDelete(resume.id)} className="btn-small btn-danger">Delete</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No resumes found. <Link to="/resume/create">Create your first resume</Link></p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Resumes;
