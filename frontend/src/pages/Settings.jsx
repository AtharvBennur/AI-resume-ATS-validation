import { useState } from 'react';
import '../styles/pages.css';

function Settings() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [resumeFormat, setResumeFormat] = useState('pdf');

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.style.colorScheme = newTheme === 'dark' ? 'dark' : 'light';
  };

  const handleSave = () => {
    localStorage.setItem('emailNotifications', emailNotifications);
    localStorage.setItem('resumeFormat', resumeFormat);
  };

  return (
    <div className="settings-page">
      <div className="container">
        <h1>Settings</h1>

        {/* Appearance */}
        <div className="settings-section">
          <h2>Appearance</h2>
          <div className="setting-item">
            <label>Theme</label>
            <div className="radio-group">
              <label className="radio-label">
                <input type="radio" checked={theme === 'light'} onChange={() => handleThemeChange('light')} />
                <span>Light</span>
              </label>
              <label className="radio-label">
                <input type="radio" checked={theme === 'dark'} onChange={() => handleThemeChange('dark')} />
                <span>Dark</span>
              </label>
              <label className="radio-label">
                <input type="radio" checked={theme === 'system'} onChange={() => handleThemeChange('system')} />
                <span>System</span>
              </label>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-section">
          <h2>Notifications</h2>
          <div className="setting-item">
            <label>
              <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} />
              <span>Email Notifications</span>
            </label>
            <p className="setting-description">Receive email updates about your resume and job matches</p>
          </div>
        </div>

        {/* Resume Preferences */}
        <div className="settings-section">
          <h2>Resume Preferences</h2>
          <div className="setting-item">
            <label>Default Resume Format</label>
            <select value={resumeFormat} onChange={(e) => setResumeFormat(e.target.value)}>
              <option value="pdf">PDF</option>
              <option value="docx">Word (.docx)</option>
              <option value="html">HTML</option>
            </select>
          </div>
        </div>

        <button onClick={handleSave} className="btn btn-primary">Save Settings</button>
      </div>
    </div>
  );
}

export default Settings;
