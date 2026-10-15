import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages.css';

function Home({ isAuthenticated = false }) {
  const [journeyStage, setJourneyStage] = useState(0);
  const homeRef = useRef(null);
  const cursorRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const updateJourney = () => {
      const journey = document.querySelector('[data-application-journey]');
      if (!journey) return;

      // Start the choreography as the chapter reaches the middle of the viewport,
      // so the plane is visible while this section is being read.
      const viewportProgress = ((window.innerHeight * 0.56) - journey.getBoundingClientRect().top) / journey.offsetHeight;
      setJourneyStage(viewportProgress > 0.62 ? 2 : viewportProgress > 0.18 ? 1 : 0);
    };

    updateJourney();
    window.addEventListener('scroll', updateJourney, { passive: true });
    window.addEventListener('resize', updateJourney);
    return () => {
      window.removeEventListener('scroll', updateJourney);
      window.removeEventListener('resize', updateJourney);
    };
  }, []);

  useEffect(() => {
    const home = homeRef.current;
    if (!home || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const magneticItems = [...home.querySelectorAll('[data-magnetic]')];
    const resetMagnet = (element) => { element.style.transform = ''; };
    const leaveMagnet = (event) => resetMagnet(event.currentTarget);
    const moveMagnet = (event) => {
      const element = event.currentTarget;
      const bounds = element.getBoundingClientRect();
      const x = (event.clientX - bounds.left - bounds.width / 2) * 0.14;
      const y = (event.clientY - bounds.top - bounds.height / 2) * 0.18;
      element.style.transform = `translate(${x}px, ${y}px)`;
    };

    magneticItems.forEach((item) => {
      item.addEventListener('pointermove', moveMagnet);
      item.addEventListener('pointerleave', leaveMagnet);
    });

    return () => {
      magneticItems.forEach((item) => {
        item.removeEventListener('pointermove', moveMagnet);
        item.removeEventListener('pointerleave', leaveMagnet);
        resetMagnet(item);
      });
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const context = canvas.getContext('2d');
    let frameId;
    let width = 0;
    let height = 0;
    const pointer = { x: 0.5, y: 0.45 };
    const particles = Array.from({ length: 42 }, (_, index) => ({
      x: (index * 59 % 997) / 997,
      y: (index * 173 % 991) / 991,
      z: 0.18 + ((index * 31) % 79) / 100,
      drift: 0.15 + ((index * 17) % 40) / 100
    }));

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const draw = (timestamp) => {
      context.clearRect(0, 0, width, height);
      const time = timestamp * 0.00018;
      particles.forEach((particle) => {
        const depth = particle.z;
        const x = (particle.x + Math.sin(time * particle.drift + particle.y * 8) * 0.035 - (pointer.x - 0.5) * (1 - depth) * 0.22) * width;
        const y = (particle.y + Math.cos(time * particle.drift + particle.x * 9) * 0.035 - (pointer.y - 0.5) * (1 - depth) * 0.22) * height;
        const radius = 0.7 + depth * 2.7;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(190, 150, 87, ${0.13 + depth * 0.35})`;
        context.fill();
      });
      frameId = window.requestAnimationFrame(draw);
    };
    const move = (event) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = (event.clientX - bounds.left) / bounds.width;
      pointer.y = (event.clientY - bounds.top) / bounds.height;
    };

    resize();
    window.addEventListener('resize', resize);
    canvas.parentElement?.addEventListener('pointermove', move);
    frameId = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      canvas.parentElement?.removeEventListener('pointermove', move);
    };
  }, []);

  const moveCursor = (event) => {
    if (cursorRef.current) cursorRef.current.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
  };

  return (
    <div className="home-page" ref={homeRef} onPointerMove={moveCursor}>
      <span className="home-cursor" ref={cursorRef} aria-hidden="true" />
      <canvas className="hero-particle-field" ref={canvasRef} aria-hidden="true" />
      <section className="hero-section">
        <span className="home-motion home-motion-one" aria-hidden="true" />
        <div className="hero-content">
          <img className="home-brand-mark" src="/resume-mark.svg" alt="AI Resume Maker logo" />
          <span className="hero-kicker">AI RESUME STUDIO · ATS-READY BY DESIGN</span>
          <h1><span>A sharper story.</span><br /><em>One clear format.</em></h1>
          <p>Build a focused, recruiter-readable resume with thoughtful AI assistance, secure saving, and a reliable PDF export.</p>
          <div className="hero-buttons">
            <Link to={isAuthenticated ? '/dashboard' : '/login'} className="btn btn-primary btn-large" data-magnetic>
              {isAuthenticated ? 'Go to your workspace' : 'Sign in to your workspace'} <span aria-hidden="true">↗</span>
            </Link>
            <Link to={isAuthenticated ? '/resume/create' : '/register'} className="hero-text-link" data-magnetic>
              {isAuthenticated ? 'Build a resume' : 'Create an account'}
            </Link>
          </div>
          <div className="home-scroll-cue" aria-hidden="true"><span /> Scroll to explore</div>
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

      <section className="trust-chapter" aria-label="Resume quality signals">
        <span className="home-motion home-motion-two" aria-hidden="true" />
        <span className="home-motion home-motion-three" aria-hidden="true" />
        <div className="trust-orbit trust-orbit-one" aria-hidden="true" />
        <div className="trust-orbit trust-orbit-two" aria-hidden="true" />
        <div className="trust-chapter-copy">
          <span className="hero-kicker">THE QUIET CONFIDENCE OF CLARITY</span>
          <h2>Every detail<br /><em>in its right place.</em></h2>
          <p>Designed to feel composed before a recruiter reads the first line.</p>
        </div>
        <div className="trust-signals" aria-label="Resume quality details">
          <article><span className="trust-signal-symbol">01</span><strong>Signal, not noise</strong><small>A disciplined visual hierarchy keeps attention on your experience.</small></article>
          <article><span className="trust-signal-symbol">✦</span><strong>Ready for systems</strong><small>Text-first structure keeps every important word readable.</small></article>
          <article><span className="trust-signal-symbol">✓</span><strong>Made to travel</strong><small>A polished document that feels at home in every inbox.</small></article>
        </div>
      </section>

      <section className="application-journey" data-application-journey aria-label="How your resume reaches an opportunity">
        <span className="home-motion home-motion-four" aria-hidden="true" />
        <div className="journey-intro">
          <span className="hero-kicker">A CONSIDERED SEND</span>
          <h2>Prepared with care.<br /><em>Sent with intent.</em></h2>
          <p>Scroll through the journey: a precise resume becomes a confident application, ready for the opportunity you chose.</p>
        </div>
        <div className={`journey-stage journey-stage-${journeyStage}`} aria-live="polite">
          <div className="journey-rail" aria-hidden="true"><span /></div>
          <div className="journey-resume" aria-label="Resume document">
            <span className="journey-resume-name">A. BENNUR</span>
            <i /><i /><i /><i />
          </div>
          <div className="journey-plane" aria-hidden="true"><span>✦</span></div>
          <div className="opportunity-card">
            <div className="opportunity-brand"><span>✦</span> NORTHSTAR</div>
            <strong>Software Engineer</strong>
            <small>Remote · Full-time</small>
            <div className="opportunity-rule" />
            <p>Building thoughtful tools for ambitious teams.</p>
          </div>
          <div className="selection-note" role="status">
            <span className="selection-check">✓</span>
            <span><strong>Application selected</strong><small>Your profile is ready for review.</small></span>
          </div>
        </div>
        <div className="journey-legend" aria-hidden="true">
          <span className={journeyStage >= 0 ? 'is-active' : ''}>01 · Refine</span>
          <span className={journeyStage >= 1 ? 'is-active' : ''}>02 · Send</span>
          <span className={journeyStage >= 2 ? 'is-active' : ''}>03 · Selected</span>
        </div>
      </section>

      <section className="format-section">
        <span className="home-motion home-motion-five" aria-hidden="true" />
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
          <Link to={isAuthenticated ? '/resume/create' : '/register'} className="format-cta">{isAuthenticated ? 'Start building' : 'Create your account'} <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
