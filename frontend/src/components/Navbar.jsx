import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';
import { useState } from 'react';

function Navbar({ isAuthenticated, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    onLogout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">📄</span>
          AI Resume Maker
        </Link>

        <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>
          
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/resume/create" className={`nav-link ${location.pathname === '/resume/create' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                Create Resume
              </Link>
              <Link to="/resume/update" className={`nav-link ${location.pathname === '/resume/update' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                Update Resume
              </Link>
              <Link to="/resume/enhance" className={`nav-link ${location.pathname === '/resume/enhance' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                Enhance Resume
              </Link>
              <Link to="/ats" className={`nav-link ${location.pathname === '/ats' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                ATS Validation
              </Link>
              <Link to="/resumes" className={`nav-link ${location.pathname === '/resumes' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                My Resumes
              </Link>
              <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                Profile
              </Link>
              <Link to="/settings" className={`nav-link ${location.pathname === '/settings' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                Settings
              </Link>
            </>
          )}
        </div>

        <div className="navbar-auth">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          ) : (
            <button onClick={handleLogout} className="btn btn-danger">
              Logout
            </button>
          )}
        </div>

        <div className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
