import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const workspaceLinks = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Create Resume', path: '/resume/create' },
  { label: 'Enhance Resume', path: '/resume/enhance' },
  { label: 'ATS Validation', path: '/ats' },
  { label: 'My Resumes', path: '/resumes' },
  { label: 'Profile', path: '/profile' }
];

function Navbar({ isAuthenticated, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const userName = localStorage.getItem('userName')?.trim();
  const firstName = userName?.split(/\s+/)[0] || 'Your workspace';

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    onLogout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className={`navbar${isAuthenticated ? ' navbar-authenticated' : ''}`}>
      <div className="navbar-container">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="navbar-logo" aria-label={isAuthenticated ? 'Go to your dashboard' : 'AI Resume Maker home'}>
          <img className="navbar-logo-image" src="/resume-mark.svg" alt="" />
          <span className="navbar-brand-copy">
            <span>AI Resume Maker</span>
            {isAuthenticated && <small>CAREER STUDIO</small>}
          </span>
        </Link>

        {isAuthenticated ? (
          <>
            <div className="navbar-workspace">
              <span className="workspace-avatar" aria-hidden="true">
                {firstName.slice(0, 1).toUpperCase()}
              </span>
              <span className="workspace-greeting">
                <small>WELCOME BACK</small>
                <strong>{firstName}</strong>
              </span>
              <button
                type="button"
                className={`mobile-toggle${menuOpen ? ' is-open' : ''}`}
                aria-label={menuOpen ? 'Close workspace menu' : 'Open workspace menu'}
                aria-expanded={menuOpen}
                aria-controls="workspace-navigation"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <span />
                <span />
                <span />
              </button>
            </div>
            <div
              id="workspace-navigation"
              className={`navbar-menu${menuOpen ? ' active' : ''}`}
              aria-hidden={!menuOpen}
            >
              <span className="menu-eyebrow">YOUR WORKSPACE</span>
              {workspaceLinks.map(({ label, path }) => (
                <Link
                  key={path}
                  to={path}
                  tabIndex={menuOpen ? 0 : -1}
                  aria-current={location.pathname === path ? 'page' : undefined}
                  className={`nav-link${location.pathname === path ? ' active' : ''}`}
                >
                  <span>{label}</span>
                  <span className="nav-link-arrow" aria-hidden="true">↗</span>
                </Link>
              ))}
              <div className="navbar-menu-footer">
                <span>Signed in as {localStorage.getItem('userEmail') || 'member'}</span>
                <button type="button" onClick={handleLogout}>Sign out</button>
              </div>
            </div>
          </>
        ) : (
          <div className="navbar-auth">
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
