import { Link } from 'react-router-dom';
import '../styles/pages.css';

function Home() {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-kicker">AI RESUME STUDIO · ATS-READY BY DESIGN</span>
          <h1>A sharper story.<br /><em>One clear format.</em></h1>
          <p>Build a focused, recruiter-readable resume with thoughtful AI assistance, secure saving, and a reliable PDF export.</p>
          <div className="hero-buttons">
            <Link to="/resume/create" className="btn btn-primary btn-large">
              Build your resume <span aria-hidden="true">↗</span>
            </Link>
            <Link to="/login" className="hero-text-link">Sign in to your workspace</Link>
          </div>
        </div>
        <div className="hero-visual" aria-label="Preview of the resume format">
          <div className="resume-mockup">
            <div className="resume-header">
              <div className="resume-name">Atharv Bennur</div>
              <div className="resume-title">Software Engineer | AWS Cloud &amp; DevOps | AWS Certified</div>
              <div className="resume-contact">atharvbennur@gmail.com&nbsp; | &nbsp;+91 8611812157&nbsp; | &nbsp;India&nbsp; | &nbsp;LinkedIn</div>
            </div>
            <div className="resume-section">
              <div className="section-title">Professional Summary</div>
              <div className="section-content">Software Engineer and BCA student specialising in cloud-native, AI-enabled and full-stack applications. AWS Certified Cloud Practitioner and AI Practitioner, with hands-on experience across Python, Flask, React, SQL and Docker.</div>
            </div>
            <div className="resume-section">
              <div className="section-title">Technical Skills</div>
              <div className="section-content">AWS · Terraform · Docker · GitHub Actions · Python · JavaScript · Flask · React · SQL</div>
            </div>
            <div className="resume-section">
              <div className="section-title">Certifications</div>
              <div className="section-content">AWS Certified Cloud Practitioner · AWS Certified AI Practitioner</div>
            </div>
            <div className="resume-section">
              <div className="section-title">Professional Experience</div>
              <div className="section-content">
                <div className="exp-item">AWS Cloud Infrastructure &amp; Deployment Intern</div>
                <div>Zynanity · Appaayoga Academy</div>
                <div className="resume-rule" />
                <div className="resume-lines" />
              </div>
            </div>
            <div className="resume-section">
              <div className="section-title">Projects</div>
              <div className="section-content">CloudBridge · CloudGuard · BridgeTheGap</div>
            </div>
            <div className="resume-section">
              <div className="section-title">Achievements</div>
              <div className="section-content">Hackathon placements · Competition awards</div>
            </div>
            <div className="resume-section">
              <div className="section-title">Education</div>
              <div className="section-content">Bachelor of Computer Applications · 2024–2027</div>
            </div>
          </div>
        </div>
      </section>

      <section className="format-section">
        <div className="container">
          <div className="format-heading">
            <span className="hero-kicker">BUILT FOR CLARITY</span>
            <h2>Every section earns its place.</h2>
          </div>
          <div className="format-list">
            <div><span>01</span><strong>One consistent structure</strong><p>Professional summary, skills, certifications, experience, projects, achievements, and education.</p></div>
            <div><span>02</span><strong>AI that stays grounded</strong><p>Generate a concise summary from the information you provide, without invented credentials or results.</p></div>
            <div><span>03</span><strong>Your work, ready to share</strong><p>Save to your MongoDB-backed account and download a clean, text-based PDF.</p></div>
          </div>
          <Link to="/resume/create" className="format-cta">Start building <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
