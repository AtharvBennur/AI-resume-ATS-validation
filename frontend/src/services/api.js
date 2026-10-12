const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const DEMO_CREDENTIALS = {
  email: 'demo@airesume.local',
  password: 'Demo@1234'
};

const request = async (path, options = {}) => {
  const token = localStorage.getItem('authToken');
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    },
    ...options
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || payload.error || 'Request failed');
  }

  return payload;
};

const requireRegisteredAccount = () => {
  const token = localStorage.getItem('authToken');
  if (!token || token === 'demo-token-local') {
    throw new Error('Sign in with a registered account to upload resumes or save ATS results.');
  }
};

export const rewriteResumeSection = (text, section) => request('/ai/rewrite', {
  method: 'POST',
  body: JSON.stringify({ text, section })
});

// Mock data
const mockUsers = {
  [DEMO_CREDENTIALS.email]: { id: 'demo-user', name: 'Demo User', email: DEMO_CREDENTIALS.email, phone: '', location: '', linkedin: '', github: '', portfolio: '' },
  'user@example.com': { id: 1, name: 'Atharv Kumar', email: 'user@example.com', phone: '+91 9876543210', location: 'Bangalore, India', linkedin: 'linkedin.com/in/atharv', github: 'github.com/atharv', portfolio: 'atharv.dev' }
};

const demoResumeData = {
  personalInfo: {
    fullName: 'Atharv Bennur',
    professionalTitle: 'Software Developer',
    email: 'demo@airesume.local',
    phone: '+91 9876543210',
    location: 'Bengaluru, India',
    linkedin: 'linkedin.com/in/atharv',
    github: 'github.com/atharv'
  },
  professionalSummary: 'Software developer focused on building reliable, user-friendly applications with modern web technologies.',
  education: [{ institution: 'University of Technology', degree: 'B.Tech', field: 'Computer Science', startYear: '2020', endYear: '2024', cgpa: '8.6' }],
  skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
  experience: [{ company: 'Tech Company', role: 'Software Developer', location: 'Bengaluru', startDate: '2024', endDate: 'Present', description: 'Built and improved full-stack web applications for career development.' }],
  projects: [{ name: 'AI Resume Maker', description: 'Created a resume builder with ATS validation and tailored resume enhancement.', technologies: 'React, Node.js, MongoDB' }],
  certifications: [],
  achievements: []
};

const mockResumes = [
  { id: 1, name: 'Cloud Engineer Resume', lastUpdated: '2026-08-15', atsScore: 0, data: { ...demoResumeData, personalInfo: { ...demoResumeData.personalInfo, professionalTitle: 'Cloud Engineer' } } },
  { id: 2, name: 'Data Engineer Resume', lastUpdated: '2026-08-10', atsScore: 0, data: { ...demoResumeData, personalInfo: { ...demoResumeData.personalInfo, professionalTitle: 'Data Engineer' } } },
  { id: 3, name: 'Software Developer Resume', lastUpdated: '2026-08-05', atsScore: 0, data: demoResumeData }
];

// Auth APIs
export const loginUser = async (email, password) => {
  if (email.trim().toLowerCase() === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
    return { success: true, token: 'demo-token-local', user: mockUsers[DEMO_CREDENTIALS.email] };
  }

  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
};

export const registerUser = async (name, email, password) => {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
};

export const getProfile = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const token = localStorage.getItem('authToken');
      const email = localStorage.getItem('userEmail');
      if (token && email) {
        resolve({ success: true, user: mockUsers[email] });
      } else {
        resolve({ success: false });
      }
    }, 300);
  });
};

export const updateProfile = async (profileData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const email = localStorage.getItem('userEmail');
      if (email) {
        mockUsers[email] = { ...mockUsers[email], ...profileData };
        resolve({ success: true, user: mockUsers[email] });
      }
    }, 300);
  });
};

// Resume APIs
export const createResume = async (resumeData) => {
  const token = localStorage.getItem('authToken');
  if (token && token !== 'demo-token-local') {
    return request('/resumes', { method: 'POST', body: JSON.stringify({ data: resumeData }) });
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      const newResume = {
        id: mockResumes.length + 1,
        name: resumeData.personalInfo?.fullName || 'New Resume',
        lastUpdated: new Date().toISOString().split('T')[0],
        atsScore: 0,
        data: resumeData
      };
      mockResumes.push(newResume);
      localStorage.setItem('currentResume', JSON.stringify(newResume));
      resolve({ success: true, resume: newResume });
    }, 500);
  });
};

export const getResumes = async () => {
  const token = localStorage.getItem('authToken');
  if (token && token !== 'demo-token-local') return request('/resumes');

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, resumes: mockResumes });
    }, 300);
  });
};

export const getResume = async (id) => {
  const token = localStorage.getItem('authToken');
  if (token && token !== 'demo-token-local') return request(`/resumes/${id}`);

  return new Promise((resolve) => {
    setTimeout(() => {
      const resume = mockResumes.find(r => r.id === parseInt(id));
      resolve({ success: true, resume: resume || {} });
    }, 300);
  });
};

export const updateResume = async (id, resumeData) => {
  const token = localStorage.getItem('authToken');
  if (token && token !== 'demo-token-local') {
    return request(`/resumes/${id}`, { method: 'PUT', body: JSON.stringify({ data: resumeData }) });
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockResumes.findIndex(r => r.id === parseInt(id));
      if (index !== -1) {
        mockResumes[index] = { ...mockResumes[index], data: resumeData, lastUpdated: new Date().toISOString().split('T')[0] };
        resolve({ success: true, resume: mockResumes[index] });
      }
    }, 500);
  });
};

export const deleteResume = async (id) => {
  const token = localStorage.getItem('authToken');
  if (token && token !== 'demo-token-local') return request(`/resumes/${id}`, { method: 'DELETE' });

  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockResumes.findIndex(r => r.id === parseInt(id));
      if (index !== -1) {
        mockResumes.splice(index, 1);
        resolve({ success: true });
      }
    }, 300);
  });
};

// Enhancement APIs
export const matchResumeToJob = (resumeId, jobDescription) => request('/ai/job-match', {
  method: 'POST',
  body: JSON.stringify({ resumeId, jobDescription })
});

// ATS APIs
export const validateATS = (resumeFile, jobDescription = '', resumeId = '') => {
  requireRegisteredAccount();
  const formData = new FormData();
  formData.append('resume', resumeFile);
  if (jobDescription.trim()) formData.append('jobDescription', jobDescription.trim());
  if (resumeId) formData.append('resumeId', resumeId);
  return request('/ai/ats/validate', { method: 'POST', body: formData });
};

export const getATSReport = (id) => request(`/ai/ats/reports/${id}`);

export const extractResumeData = (file) => {
  requireRegisteredAccount();
  const formData = new FormData();
  formData.append('resume', file);
  return request('/ai/resume/import', { method: 'POST', body: formData });
};
