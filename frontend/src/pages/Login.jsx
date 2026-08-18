import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import '../styles/pages.css';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setGeneralError('');

    try {
      const response = await loginUser(formData.email, formData.password);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userEmail', response.user.email);
      localStorage.setItem('userName', response.user.name);
      navigate('/dashboard');
    } catch (error) {
      setGeneralError(error.message || 'Invalid email or password');
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

          {generalError && <div className="error-message">{generalError}</div>}

          <div className="demo-credentials">
            <span className="demo-label">Temporary Demo Mode</span>
            <strong>Email:</strong> user@example.com
            <strong>Password:</strong> password
            <small>No backend required — this lets you explore the inside of the app right now.</small>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={errors.password ? 'input-error' : ''}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
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
