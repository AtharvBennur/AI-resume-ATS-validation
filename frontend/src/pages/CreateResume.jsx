import { useState, useEffect } from 'react';
import { createResume, rewriteResumeSection, getResume, updateResume } from '../services/api';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { downloadResumePdf } from '../services/resumePdf';
import '../styles/pages.css';
import '../styles/ResumeBuilder.css';

const emptyResumeData = {
  personalInfo: {
    fullName: '',
    professionalTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: ''
  },
  professionalSummary: '',
  education: [],
  skills: [],
  experience: [],
  projects: [],
  certifications: [],
  achievements: []
};

const toText = (value) => value === null || value === undefined ? '' : String(value);

const normalizeResumeData = (data = {}) => ({
  ...emptyResumeData,
  ...data,
  personalInfo: {
    ...emptyResumeData.personalInfo,
    ...(data.personalInfo || {})
  },
  education: Array.isArray(data.education) ? data.education.map((entry = {}) => ({
    ...entry,
    institution: toText(entry.institution),
    degree: toText(entry.degree),
    field: toText(entry.field),
    startYear: toText(entry.startYear),
    endYear: toText(entry.endYear),
    cgpa: toText(entry.cgpa)
  })) : [],
  skills: Array.isArray(data.skills) ? data.skills.map(toText) : [],
  experience: Array.isArray(data.experience) ? data.experience.map((entry = {}) => ({
    ...entry,
    company: toText(entry.company),
    role: toText(entry.role),
    location: toText(entry.location),
    startDate: toText(entry.startDate),
    endDate: toText(entry.endDate),
    description: toText(entry.description)
  })) : [],
  projects: Array.isArray(data.projects) ? data.projects.map((entry = {}) => ({
    ...entry,
    name: toText(entry.name),
    description: toText(entry.description),
    technologies: toText(entry.technologies),
    githubLink: toText(entry.githubLink),
    liveLink: toText(entry.liveLink)
  })) : [],
  certifications: Array.isArray(data.certifications) ? data.certifications : [],
  achievements: Array.isArray(data.achievements) ? data.achievements : []
});

function CreateResume() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [saveStatus, setSaveStatus] = useState('');
  const [formData, setFormData] = useState(emptyResumeData);

  const [isLoading, setIsLoading] = useState(false);
  const [improvingField, setImprovingField] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    const loadResume = async () => {
      try {
        const importedResume = location.state?.importedResume;
        const importedTargetResumeId = location.state?.targetResumeId || '';
        if (importedResume && (!id || importedTargetResumeId === id)) {
          setFormData(normalizeResumeData(importedResume));
          setSaveStatus('Unsaved changes');
          return;
        }

        if (id) {
          const response = await getResume(id);
          if (isCurrent && response.success && response.resume.data) {
            setFormData(normalizeResumeData(response.resume.data));
          }
        } else {
          const saved = localStorage.getItem('currentResume');
          if (saved) {
            const parsed = JSON.parse(saved);
            setFormData(normalizeResumeData(parsed.data || parsed));
          }
        }
      } catch (error) {
        if (isCurrent) setActionError(error.message);
      }
    };

    loadResume();
    return () => { isCurrent = false; };
  }, [id, location.state]);

  const handlePersonalInfoChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
    setSaveStatus('Unsaved changes');
  };

  const handleSummaryChange = (value) => {
    setFormData(prev => ({ ...prev, professionalSummary: value }));
    setSaveStatus('Unsaved changes');
  };

  const handleImproveText = async (field, text, section, applyText) => {
    if (!text.trim()) return;
    setImprovingField(field);
    setActionError('');
    try {
      const response = await rewriteResumeSection(text, section);
      applyText(response.text);
    } catch (error) {
      setActionError(error.message);
    } finally {
      setImprovingField('');
    }
  };

  const improveButton = (field, text, section, applyText) => {
    const sourceText = typeof text === 'string' ? text : '';
    return (
      <button
        type="button"
        className="btn-small"
        onClick={() => handleImproveText(field, sourceText, section, applyText)}
        disabled={!sourceText.trim() || Boolean(improvingField)}
      >
        {improvingField === field ? 'Improving...' : 'Improve with AI'}
      </button>
    );
  };

  const handleDownloadPDF = async () => {
    setActionError('');
    try {
      await downloadResumePdf(formData);
    } catch (error) {
      setActionError(error.message);
    }
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { institution: '', degree: '', field: '', startYear: '', endYear: '', cgpa: '' }]
    }));
    setSaveStatus('Unsaved changes');
  };

  const updateEducation = (index, field, value) => {
    const newEducation = [...formData.education];
    newEducation[index][field] = value;
    setFormData(prev => ({ ...prev, education: newEducation }));
    setSaveStatus('Unsaved changes');
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
    setSaveStatus('Unsaved changes');
  };

  const addSkill = () => {
    setFormData(prev => ({ ...prev, skills: [...prev.skills, ''] }));
    setSaveStatus('Unsaved changes');
  };

  const updateSkill = (index, value) => {
    const newSkills = [...formData.skills];
    newSkills[index] = value;
    setFormData(prev => ({ ...prev, skills: newSkills }));
    setSaveStatus('Unsaved changes');
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
    setSaveStatus('Unsaved changes');
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { company: '', role: '', location: '', startDate: '', endDate: '', description: '' }]
    }));
    setSaveStatus('Unsaved changes');
  };

  const updateExperience = (index, field, value) => {
    const newExperience = [...formData.experience];
    newExperience[index][field] = value;
    setFormData(prev => ({ ...prev, experience: newExperience }));
    setSaveStatus('Unsaved changes');
  };

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
    setSaveStatus('Unsaved changes');
  };

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, { name: '', description: '', technologies: '', githubLink: '', liveLink: '' }]
    }));
    setSaveStatus('Unsaved changes');
  };

  const updateProject = (index, field, value) => {
    const newProjects = [...formData.projects];
    newProjects[index][field] = value;
    setFormData(prev => ({ ...prev, projects: newProjects }));
    setSaveStatus('Unsaved changes');
  };

  const removeProject = (index) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
    setSaveStatus('Unsaved changes');
  };

  const handleSaveResume = async () => {
    setIsLoading(true);
    setActionError('');
    try {
      if (id) {
        await updateResume(id, formData);
        navigate(`/resume/${id}/edit`, { replace: true, state: null });
      } else {
        const response = await createResume(formData);
        if (!response.resume?.id) throw new Error('Resume was saved but its ID was not returned.');
        localStorage.removeItem('currentResume');
        navigate(`/resume/${response.resume.id}/edit`, { replace: true, state: null });
      }
      setSaveStatus('Saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      setSaveStatus('Unsaved changes');
      setActionError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all changes?')) {
      setFormData({
        ...emptyResumeData,
        personalInfo: { ...emptyResumeData.personalInfo }
      });
      setSaveStatus('');
    }
  };

  return (
    <div className="resume-builder">
      <div className="builder-header">
        <h1>Resume Builder</h1>
        <div className="builder-controls">
          <span className={`save-status ${saveStatus === 'Saved' ? 'saved' : ''}`}>{saveStatus || 'Ready'}</span>
          <button onClick={handleSaveResume} className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Resume'}
          </button>
          <button onClick={handleReset} className="btn btn-secondary">Reset</button>
          <button onClick={handleDownloadPDF} className="btn btn-secondary">Download PDF</button>
        </div>
      </div>
      {actionError && <p className="builder-error" role="alert">{actionError}</p>}

      <div className="builder-container">
        {/* Left - Form */}
        <div className="builder-form">
          {/* Personal Information */}
          <section className="form-section">
            <h2>Personal Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input value={formData.personalInfo.fullName} onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)} placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label>Professional Title *</label>
                <input value={formData.personalInfo.professionalTitle} onChange={(e) => handlePersonalInfoChange('professionalTitle', e.target.value)} placeholder="Cloud Engineer" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={formData.personalInfo.email} onChange={(e) => handlePersonalInfoChange('email', e.target.value)} placeholder="john@example.com" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={formData.personalInfo.phone} onChange={(e) => handlePersonalInfoChange('phone', e.target.value)} placeholder="+1 234 567 8900" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input value={formData.personalInfo.location} onChange={(e) => handlePersonalInfoChange('location', e.target.value)} placeholder="San Francisco, USA" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>LinkedIn</label>
                <input value={formData.personalInfo.linkedin} onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)} placeholder="linkedin.com/in/johndoe" />
              </div>
              <div className="form-group">
                <label>GitHub</label>
                <input value={formData.personalInfo.github} onChange={(e) => handlePersonalInfoChange('github', e.target.value)} placeholder="github.com/johndoe" />
              </div>
            </div>
            <div className="form-group">
              <label>Portfolio</label>
              <input value={formData.personalInfo.portfolio} onChange={(e) => handlePersonalInfoChange('portfolio', e.target.value)} placeholder="johndoe.dev" />
            </div>
          </section>

          {/* Professional Summary */}
          <section className="form-section">
            <div className="section-header">
              <h2>Professional Summary</h2>
              {improveButton('summary', formData.professionalSummary, 'professional summary', handleSummaryChange)}
            </div>
            <textarea value={formData.professionalSummary} onChange={(e) => handleSummaryChange(e.target.value)} placeholder="Experienced developer with 5+ years in cloud technologies..." rows="4" />
          </section>

          <section className="form-section">
            <div className="section-header">
              <h2>Certifications</h2>
              <button type="button" onClick={() => setFormData(prev => ({ ...prev, certifications: [...prev.certifications, { name: '', issuer: '', date: '', description: '' }] }))} className="btn-small">+ Add Certification</button>
            </div>
            {formData.certifications.map((certification, index) => (
              <div key={index} className="entry-block">
                <div className="form-row">
                  <div className="form-group">
                    <label>Certification</label>
                    <input value={typeof certification === 'string' ? certification : certification.name || ''} onChange={(e) => {
                      const certifications = [...formData.certifications];
                      certifications[index] = { ...(typeof certification === 'object' ? certification : {}), name: e.target.value };
                      setFormData(prev => ({ ...prev, certifications }));
                      setSaveStatus('Unsaved changes');
                    }} placeholder="AWS Certified Cloud Practitioner" />
                  </div>
                  <div className="form-group">
                    <label>Issuer and date</label>
                    <input value={[certification.issuer, certification.date].filter(Boolean).join(' | ')} onChange={(e) => {
                      const [issuer, ...date] = e.target.value.split('|');
                      const certifications = [...formData.certifications];
                      certifications[index] = { ...(typeof certification === 'object' ? certification : { name: certification }), issuer: issuer.trim(), date: date.join('|').trim() };
                      setFormData(prev => ({ ...prev, certifications }));
                      setSaveStatus('Unsaved changes');
                    }} placeholder="Amazon Web Services | 2026" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={certification.description || ''} onChange={(e) => {
                    const certifications = [...formData.certifications];
                    certifications[index] = { ...certification, description: e.target.value };
                    setFormData(prev => ({ ...prev, certifications }));
                    setSaveStatus('Unsaved changes');
                  }} rows="2" />
                  {improveButton(`certification-${index}`, certification.description || '', 'certification', (text) => {
                    const certifications = [...formData.certifications];
                    certifications[index] = { ...certification, description: text };
                    setFormData(prev => ({ ...prev, certifications }));
                    setSaveStatus('Unsaved changes');
                  })}
                </div>
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, certifications: prev.certifications.filter((_, itemIndex) => itemIndex !== index) }))} className="btn-danger btn-small">Remove</button>
              </div>
            ))}
          </section>

          {/* Education */}
          <section className="form-section">
            <div className="section-header">
              <h2>Education</h2>
              <button onClick={addEducation} className="btn-small">+ Add Education</button>
            </div>
            {formData.education.map((edu, index) => (
              <div key={index} className="entry-block">
                <div className="form-row">
                  <div className="form-group">
                    <label>Institution</label>
                    <input value={edu.institution} onChange={(e) => updateEducation(index, 'institution', e.target.value)} placeholder="MIT" />
                  </div>
                  <div className="form-group">
                    <label>Degree</label>
                    <input value={edu.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} placeholder="BS" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Field</label>
                    <input value={edu.field} onChange={(e) => updateEducation(index, 'field', e.target.value)} placeholder="Computer Science" />
                  </div>
                  <div className="form-group">
                    <label>CGPA</label>
                    <input value={edu.cgpa} onChange={(e) => updateEducation(index, 'cgpa', e.target.value)} placeholder="3.8" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Year</label>
                    <input type="number" value={edu.startYear} onChange={(e) => updateEducation(index, 'startYear', e.target.value)} placeholder="2015" />
                  </div>
                  <div className="form-group">
                    <label>End Year</label>
                    <input type="number" value={edu.endYear} onChange={(e) => updateEducation(index, 'endYear', e.target.value)} placeholder="2019" />
                  </div>
                </div>
                <button onClick={() => removeEducation(index)} className="btn-danger btn-small">Remove</button>
              </div>
            ))}
          </section>

          {/* Technical Skills */}
          <section className="form-section">
            <div className="section-header">
              <h2>Technical Skills</h2>
              <button onClick={addSkill} className="btn-small">+ Add Skill</button>
            </div>
            <div className="skills-input">
              {formData.skills.map((skill, index) => (
                <div key={index} className="skill-input-group">
                  <input value={skill} onChange={(e) => updateSkill(index, e.target.value)} placeholder="JavaScript" />
                  <button onClick={() => removeSkill(index)} className="btn-icon">✕</button>
                </div>
              ))}
            </div>
          </section>

          {/* Experience */}
          <section className="form-section">
            <div className="section-header">
              <h2>Experience</h2>
              <button onClick={addExperience} className="btn-small">+ Add Experience</button>
            </div>
            {formData.experience.map((exp, index) => (
              <div key={index} className="entry-block">
                <div className="form-row">
                  <div className="form-group">
                    <label>Company</label>
                    <input value={exp.company} onChange={(e) => updateExperience(index, 'company', e.target.value)} placeholder="Tech Corp" />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <input value={exp.role} onChange={(e) => updateExperience(index, 'role', e.target.value)} placeholder="Senior Developer" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Location</label>
                    <input value={exp.location} onChange={(e) => updateExperience(index, 'location', e.target.value)} placeholder="San Francisco" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input type="text" value={exp.startDate} onChange={(e) => updateExperience(index, 'startDate', e.target.value)} placeholder="e.g. Sep 2024" />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input type="text" value={exp.endDate} onChange={(e) => updateExperience(index, 'endDate', e.target.value)} placeholder="e.g. Present" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={exp.description} onChange={(e) => updateExperience(index, 'description', e.target.value)} placeholder="Describe your responsibilities and achievements" rows="3" />
                  {improveButton(`experience-${index}`, exp.description, 'professional experience', (text) => updateExperience(index, 'description', text))}
                </div>
                <button onClick={() => removeExperience(index)} className="btn-danger btn-small">Remove</button>
              </div>
            ))}
          </section>

          {/* Projects */}
          <section className="form-section">
            <div className="section-header">
              <h2>Projects</h2>
              <button onClick={addProject} className="btn-small">+ Add Project</button>
            </div>
            {formData.projects.map((proj, index) => (
              <div key={index} className="entry-block">
                <div className="form-group">
                  <label>Project Name</label>
                  <input value={proj.name} onChange={(e) => updateProject(index, 'name', e.target.value)} placeholder="Cloud Dashboard" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={proj.description} onChange={(e) => updateProject(index, 'description', e.target.value)} placeholder="Describe your project" rows="2" />
                  {improveButton(`project-${index}`, proj.description, 'project', (text) => updateProject(index, 'description', text))}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Technologies</label>
                    <input value={proj.technologies} onChange={(e) => updateProject(index, 'technologies', e.target.value)} placeholder="AWS, React, Node.js" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>GitHub Link</label>
                    <input value={proj.githubLink} onChange={(e) => updateProject(index, 'githubLink', e.target.value)} placeholder="github.com/..." />
                  </div>
                  <div className="form-group">
                    <label>Live Link</label>
                    <input value={proj.liveLink} onChange={(e) => updateProject(index, 'liveLink', e.target.value)} placeholder="example.com" />
                  </div>
                </div>
                <button onClick={() => removeProject(index)} className="btn-danger btn-small">Remove</button>
              </div>
            ))}
          </section>
          <section className="form-section">
            <div className="section-header">
              <h2>Achievements</h2>
              <button type="button" onClick={() => setFormData(prev => ({ ...prev, achievements: [...prev.achievements, ''] }))} className="btn-small">+ Add Achievement</button>
            </div>
            {formData.achievements.map((achievement, index) => {
              const achievementText = typeof achievement === 'string' ? achievement : achievement.title || '';
              const updateAchievement = (text) => {
                const achievements = [...formData.achievements];
                achievements[index] = text;
                setFormData(prev => ({ ...prev, achievements }));
                setSaveStatus('Unsaved changes');
              };

              return (
                <div key={index} className="achievement-entry">
                  <input value={achievementText} onChange={(e) => updateAchievement(e.target.value)} placeholder="Award, competition placement, or recognition" />
                  {improveButton(`achievement-${index}`, achievementText, 'achievement', updateAchievement)}
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, achievements: prev.achievements.filter((_, itemIndex) => itemIndex !== index) }))} className="btn-icon" aria-label="Remove achievement">✕</button>
                </div>
              );
            })}
          </section>
        </div>

        {/* Right - Preview */}
        <div className="builder-preview">
          <div className="preview-sticky">
            <div className="resume-preview">
              <div className="resume-container">
                <div className="resume-header" style={{ order: 0 }}>
                  <div className="resume-name">{formData.personalInfo.fullName || 'Your Name'}</div>
                  <div className="resume-title">{formData.personalInfo.professionalTitle || 'Professional Title'}</div>
                  <div className="resume-contact">
                    {[formData.personalInfo.email, formData.personalInfo.phone, formData.personalInfo.location, formData.personalInfo.linkedin, formData.personalInfo.github, formData.personalInfo.portfolio].filter(Boolean).join(' | ')}
                  </div>
                </div>

                {formData.professionalSummary && (
                  <div className="resume-section" style={{ order: 1 }}>
                    <div className="section-title">PROFESSIONAL SUMMARY</div>
                    <div className="section-content">{formData.professionalSummary}</div>
                  </div>
                )}

                {formData.certifications.length > 0 && (
                  <div className="resume-section" style={{ order: 3 }}>
                    <div className="section-title">CERTIFICATIONS</div>
                    {formData.certifications.map((certification, idx) => (
                      <div key={idx} className="item">
                        <div className="item-title">{typeof certification === 'string' ? certification : certification.name}</div>
                        {typeof certification === 'object' && <div className="item-subtitle">{[certification.issuer, certification.date].filter(Boolean).join(' | ')}</div>}
                        {typeof certification === 'object' && certification.description && <div className="item-description">{certification.description}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {formData.education.length > 0 && (
                  <div className="resume-section" style={{ order: 7 }}>
                    <div className="section-title">EDUCATION</div>
                    <div className="section-content">
                      {formData.education.map((edu, idx) => (
                        <div key={idx} className="item">
                          <div className="item-header">
                            <span className="item-title">{edu.degree} in {edu.field}</span>
                            <span className="item-date">{edu.startYear} - {edu.endYear}</span>
                          </div>
                          <div>{edu.institution}</div>
                          {edu.cgpa && <div>CGPA: {edu.cgpa}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.skills.length > 0 && (
                  <div className="resume-section" style={{ order: 2 }}>
                    <div className="section-title">TECHNICAL SKILLS</div>
                    <div className="skills-list">{formData.skills.join(' • ')}</div>
                  </div>
                )}

                {formData.experience.length > 0 && (
                  <div className="resume-section" style={{ order: 4 }}>
                    <div className="section-title">PROFESSIONAL EXPERIENCE</div>
                    <div className="section-content">
                      {formData.experience.map((exp, idx) => (
                        <div key={idx} className="item">
                          <div className="item-header">
                            <span className="item-title">{exp.role}</span>
                            <span className="item-date">{exp.startDate} - {exp.endDate}</span>
                          </div>
                          <div className="item-subtitle">{exp.company}, {exp.location}</div>
                          <div className="item-description">{exp.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.projects.length > 0 && (
                  <div className="resume-section" style={{ order: 5 }}>
                    <div className="section-title">PROJECTS</div>
                    <div className="section-content">
                      {formData.projects.map((proj, idx) => (
                        <div key={idx} className="item">
                          <div className="item-header">
                            <span className="item-title">{proj.name}</span>
                          </div>
                          {proj.technologies && <div className="item-subtitle">{proj.technologies}</div>}
                          <div className="item-description">{proj.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.achievements.length > 0 && (
                  <div className="resume-section" style={{ order: 6 }}>
                    <div className="section-title">ACHIEVEMENTS</div>
                    {formData.achievements.map((achievement, idx) => (
                      <div key={idx} className="item-description">{typeof achievement === 'string' ? achievement : achievement.title}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateResume;
