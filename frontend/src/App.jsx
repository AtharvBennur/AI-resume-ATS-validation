import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreateResume from './pages/CreateResume'
import UpdateResume from './pages/UpdateResume'
import EnhanceResume from './pages/EnhanceResume'
import ATSValidation from './pages/ATSValidation'
import ATSReport from './pages/ATSReport'
import Resumes from './pages/Resumes'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('authToken')))

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    setIsAuthenticated(false)
  }

  return (
    <Router>
      <div className="app-shell">
        <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <main className="page-shell">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Dashboard /></ProtectedRoute>} />
            <Route path="/resume/create" element={<ProtectedRoute isAuthenticated={isAuthenticated}><CreateResume /></ProtectedRoute>} />
            <Route path="/resume/:id/edit" element={<ProtectedRoute isAuthenticated={isAuthenticated}><CreateResume /></ProtectedRoute>} />
            <Route path="/resume/:id/preview" element={<ProtectedRoute isAuthenticated={isAuthenticated}><CreateResume /></ProtectedRoute>} />
            <Route path="/resume/update" element={<ProtectedRoute isAuthenticated={isAuthenticated}><UpdateResume /></ProtectedRoute>} />
            <Route path="/resume/enhance" element={<ProtectedRoute isAuthenticated={isAuthenticated}><EnhanceResume /></ProtectedRoute>} />
            <Route path="/ats" element={<ProtectedRoute isAuthenticated={isAuthenticated}><ATSValidation /></ProtectedRoute>} />
            <Route path="/ats/:id" element={<ProtectedRoute isAuthenticated={isAuthenticated}><ATSReport /></ProtectedRoute>} />
            <Route path="/resumes" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Resumes /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Settings /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <footer className="site-footer">
          <div className="container footer-inner">
            <div className="footer-brand">
              <span className="logo-icon">📄</span>
              <div>
                <strong>AI Resume Maker</strong>
                <small>Career growth, simplified.</small>
              </div>
            </div>

            <div className="footer-links">
              <Link to="/">Home</Link>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/resume/create">Create Resume</Link>
            </div>

            <div className="footer-meta">
              Designed & developed by Atharv M Bennur and Namrata H K
            </div>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
