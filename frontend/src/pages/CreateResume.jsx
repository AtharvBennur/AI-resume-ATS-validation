import { useState, useEffect } from 'react';
import { createResume, getResume, updateResume } from '../services/api';
import { useParams } from 'react-router-dom';
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

const normalizeResumeData = (data = {}) => ({
  ...emptyResumeData,
  ...data,
  personalInfo: {
    ...emptyResumeData.personalInfo,
    ...(data.personalInfo || {})
  },
  education: Array.isArray(data.education) ? data.education : [],
  skills: Array.isArray(data.skills) ? data.skills : [],
  experience: Array.isArray(data.experience) ? data.experience : [],
  projects: Array.isArray(data.projects) ? data.projects : [],
  certifications: Array.isArray(data.certifications) ? data.certifications : [],
  achievements: Array.isArray(data.achievements) ? data.achievements : []
});

function CreateResume() {
  const { id } = useParams();
  const [saveStatus, setSaveStatus] = useState('');
  const [formData, setFormData] = useState(emptyResumeData);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadResume();
    } else {
      const saved = localStorage.getItem('currentResume');
      if (saved) {
        try {
          setFormData(normalizeResumeData(JSON.parse(saved).data || JSON.parse(saved)));
        } catch {
          setFormData(emptyResumeData);
        }
      }
    }
  }, [id]);

  const loadResume = async () => {
    const response = await getResume(id);
    if (response.success && response.resume.data) {
      setFormData(normalizeResumeData(response.resume.data));
    }
  };

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
    try {
      if (id) {
        await updateResume(id, formData);
      } else {
        await createResume(formData);
      }
      setSaveStatus('Saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    alert('PDF download would be implemented with a real backend');
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
          <button onClick={handleDownloadPDF} className="btn btn-secondary">Download</button>
        </div>
      </div>

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
              <button className="btn-small">Generate with AI</button>
            </div>
            <textarea value={formData.professionalSummary} onChange={(e) => handleSummaryChange(e.target.value)} placeholder="Experienced developer with 5+ years in cloud technologies..." rows="4" />
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
                    <input type="date" value={exp.startDate} onChange={(e) => updateExperience(index, 'startDate', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input type="date" value={exp.endDate} onChange={(e) => updateExperience(index, 'endDate', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={exp.description} onChange={(e) => updateExperience(index, 'description', e.target.value)} placeholder="Describe your responsibilities and achievements" rows="3" />
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
        </div>

        {/* Right - Preview */}
        <div className="builder-preview">
          <div className="preview-sticky">
            <div className="resume-preview">
              <div className="resume-container">
                <div className="resume-header">
                  <div className="resume-name">{formData.personalInfo.fullName || 'Your Name'}</div>
                  <div className="resume-title">{formData.personalInfo.professionalTitle || 'Professional Title'}</div>
                  <div className="resume-contact">
                    {formData.personalInfo.email && <span>📧 {formData.personalInfo.email}</span>}
                    {formData.personalInfo.phone && <span>📱 {formData.personalInfo.phone}</span>}
                    {formData.personalInfo.location && <span>📍 {formData.personalInfo.location}</span>}
                  </div>
                </div>

                {formData.professionalSummary && (
                  <div className="resume-section">
                    <div className="section-title">PROFESSIONAL SUMMARY</div>
                    <div className="section-content">{formData.professionalSummary}</div>
                  </div>
                )}

                {formData.education.length > 0 && (
                  <div className="resume-section">
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
                  <div className="resume-section">
                    <div className="section-title">TECHNICAL SKILLS</div>
                    <div className="skills-list">{formData.skills.join(' • ')}</div>
                  </div>
                )}

                {formData.experience.length > 0 && (
                  <div className="resume-section">
                    <div className="section-title">EXPERIENCE</div>
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
                  <div className="resume-section">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateResume;
