import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { DEMO_CREDENTIALS, loginUser } from '../services/api';
import '../styles/pages.css';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const useDemoCredentials = () => {
    setFormData(DEMO_CREDENTIALS);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await loginUser(formData.email, formData.password);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userEmail', response.user.email);
      localStorage.setItem('userName', response.user.name);
      onLogin();
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Unable to log in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2>Login to Your Account</h2>
          <p className="auth-subtitle">Welcome back! Please login with your details.</p>

          {error && <div className="error-message" role="alert">{error}</div>}

          <div className="demo-credentials">
            <span className="demo-label">Demo account</span>
            <small>Email: {DEMO_CREDENTIALS.email}</small>
            <small>Password: {DEMO_CREDENTIALS.password}</small>
            <button type="button" className="link demo-fill-button" onClick={useDemoCredentials}>
              Use demo credentials
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                value={formData.password}
                onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                placeholder="Enter your password"
                autoComplete="current-password"
                minLength="8"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/" className="link">Forgot Password?</Link>
            <div>
              Don't have an account? <Link to="/register" className="link link-strong">Register here</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
