import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/api';
import '../styles/pages.css';

function Profile() {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profileData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const response = await getProfile();
      if (response.success) {
        setProfileData(response.user);
        setFormData(response.user);
      }
      setIsLoading(false);
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await updateProfile(formData);
    setProfileData(formData);
    setIsEditing(false);
  };

  if (isLoading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="profile-page">
      <div className="container">
        <div className="page-header">
          <h1>My Profile</h1>
          {!isEditing && <button onClick={() => setIsEditing(true)} className="btn btn-secondary">Edit Profile</button>}
        </div>

        <div className="profile-card">
          {isEditing ? (
            <form onSubmit={handleSave} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input name="name" value={formData.name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" value={formData.email} onChange={handleChange} disabled />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input name="phone" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input name="location" value={formData.location} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>LinkedIn</label>
                  <input name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="linkedin.com/in/yourprofile" />
                </div>
                <div className="form-group">
                  <label>GitHub</label>
                  <input name="github" value={formData.github} onChange={handleChange} placeholder="github.com/yourprofile" />
                </div>
              </div>

              <div className="form-group">
                <label>Portfolio</label>
                <input name="portfolio" value={formData.portfolio} onChange={handleChange} placeholder="yoursite.com" />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" onClick={() => { setIsEditing(false); setFormData(profileData); }} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-row">
                <span className="label">Full Name:</span>
                <span className="value">{profileData.name}</span>
              </div>
              <div className="info-row">
                <span className="label">Email:</span>
                <span className="value">{profileData.email}</span>
              </div>
              <div className="info-row">
                <span className="label">Phone:</span>
                <span className="value">{profileData.phone || '-'}</span>
              </div>
              <div className="info-row">
                <span className="label">Location:</span>
                <span className="value">{profileData.location || '-'}</span>
              </div>
              <div className="info-row">
                <span className="label">LinkedIn:</span>
                <span className="value">{profileData.linkedin || '-'}</span>
              </div>
              <div className="info-row">
                <span className="label">GitHub:</span>
                <span className="value">{profileData.github || '-'}</span>
              </div>
              <div className="info-row">
                <span className="label">Portfolio:</span>
                <span className="value">{profileData.portfolio || '-'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
