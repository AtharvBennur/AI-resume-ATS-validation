import { Link } from 'react-router-dom';
import '../styles/pages.css';

function Home() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">AI-powered career growth</span>
          <h1>Build a Better Resume. Get Closer to Your Next Opportunity.</h1>
          <p>Create, customize, enhance and validate your resume with one simple AI-powered platform.</p>
          <div className="hero-buttons">
            <Link to="/resume/create" className="btn btn-primary btn-large">
              Create Resume
            </Link>
            <Link to="/ats" className="btn btn-secondary btn-large">
              Check ATS Score
            </Link>
          </div>
          <div className="hero-metrics">
            <div>
              <strong>86%</strong>
              <span>Average match score</span>
            </div>
            <div>
              <strong>4.9/5</strong>
              <span>Job seeker rating</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="resume-mockup">
            <div className="resume-header">
              <div className="resume-name">Atharv Kumar</div>
              <div className="resume-title">Cloud Engineer</div>
              <div className="resume-contact">📧 atharv@example.com | 📱 +91 9876543210</div>
            </div>
            <div className="resume-section">
              <div className="section-title">Professional Summary</div>
              <div className="section-content">Experienced cloud engineer with expertise in AWS, Docker, and Kubernetes...</div>
            </div>
            <div className="resume-section">
              <div className="section-title">Experience</div>
              <div className="section-content">
                <div className="exp-item">Senior Cloud Engineer | Tech Company | 2022-Present</div>
              </div>
            </div>
            <div className="resume-section">
              <div className="section-title">Skills</div>
              <div className="skills-list">AWS • Docker • Kubernetes • Python • Terraform</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-number">1</div>
              <h3>Create Resume</h3>
              <p>Enter your information and generate a professional resume in seconds.</p>
            </div>
            <div className="feature-card">
              <div className="feature-number">2</div>
              <h3>Enhance Resume</h3>
              <p>Tailor your resume according to a specific job posting with AI-powered suggestions.</p>
            </div>
            <div className="feature-card">
              <div className="feature-number">3</div>
              <h3>Validate with ATS</h3>
              <p>Check your resume score and receive detailed improvement suggestions.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
