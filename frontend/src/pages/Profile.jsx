import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProfile, updateProfile } from '../services/api';
import '../styles/pages.css';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let isCurrent = true;
    getProfile()
      .then(({ user }) => {
        if (!isCurrent) return;
        setProfile(user);
        setName(user.name);
      })
      .catch((requestError) => {
        if (isCurrent) setError(requestError.message);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setNotice('');

    try {
      const response = await updateProfile({ name });
      setProfile(response.user);
      setName(response.user.name);
      localStorage.setItem('userName', response.user.name);
      setIsEditing(false);
      setNotice('Your profile has been updated.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEditing = () => {
    setName(profile.name);
    setError('');
    setIsEditing(false);
  };

  if (isLoading) {
    return <div className="workspace-page"><div className="workspace-container"><p className="workspace-state">Loading your profile...</p></div></div>;
  }

  if (!profile) {
    return (
      <div className="workspace-page">
        <div className="workspace-container">
          <header className="workspace-page-heading">
            <span className="workspace-eyebrow">ACCOUNT</span>
            <h1>Your profile</h1>
          </header>
          <p className="workspace-message workspace-message-error" role="alert">{error || 'Your profile could not be loaded.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-page">
      <div className="workspace-container">
        <header className="workspace-page-heading">
          <span className="workspace-eyebrow">ACCOUNT</span>
          <h1>Your profile</h1>
          <p>Manage the details associated with your account.</p>
        </header>

        {error && <p className="workspace-message workspace-message-error" role="alert">{error}</p>}
        {notice && <p className="workspace-message workspace-message-success" role="status">{notice}</p>}

        <section className="profile-layout" aria-label="Account profile">
          <aside className="profile-overview">
            <div className="profile-avatar" aria-hidden="true">{profile.name.trim().charAt(0).toUpperCase()}</div>
            <h2>{profile.name}</h2>
            <p>{profile.email}</p>
            <span className="account-status"><span aria-hidden="true" /> Active account</span>
          </aside>

          <div className="profile-details">
            <div className="workspace-section-heading">
              <div>
                <span className="workspace-eyebrow">PERSONAL DETAILS</span>
                <h2>Account information</h2>
              </div>
              {!isEditing && (
                <button type="button" className="workspace-button workspace-button-secondary" onClick={() => setIsEditing(true)}>
                  Edit details
                </button>
              )}
            </div>

            {isEditing ? (
              <form className="profile-form" onSubmit={handleSave}>
                <div className="profile-field">
                  <label htmlFor="profile-name">Full name</label>
                  <input
                    id="profile-name"
                    name="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    minLength={2}
                    maxLength={80}
                    required
                  />
                </div>
                <div className="profile-field">
                  <label htmlFor="profile-email">Email address</label>
                  <input id="profile-email" value={profile.email} disabled readOnly />
                  <small>Your email address is used to sign in and cannot be changed here.</small>
                </div>
                <div className="workspace-form-actions">
                  <button type="submit" className="workspace-button workspace-button-primary" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save changes'}
                  </button>
                  <button type="button" className="workspace-button workspace-button-secondary" onClick={cancelEditing} disabled={isSaving}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <dl className="profile-information">
                <div>
                  <dt>Full name</dt>
                  <dd>{profile.name}</dd>
                </div>
                <div>
                  <dt>Email address</dt>
                  <dd>{profile.email}</dd>
                </div>
              </dl>
            )}

            <div className="profile-note">
              Resume contact details are managed separately in each resume.
              <Link to="/resumes"> View your resumes</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Profile;
