// Mock API Service
// This will be connected to the real backend later

// Mock data
const mockUsers = {
  'user@example.com': { id: 1, name: 'Atharv Kumar', email: 'user@example.com', phone: '+91 9876543210', location: 'Bangalore, India', linkedin: 'linkedin.com/in/atharv', github: 'github.com/atharv', portfolio: 'atharv.dev' }
};

const mockResumes = [
  { id: 1, name: 'Cloud Engineer Resume', lastUpdated: '2026-08-15', atsScore: 86, data: {} },
  { id: 2, name: 'Data Engineer Resume', lastUpdated: '2026-08-10', atsScore: 78, data: {} },
  { id: 3, name: 'Software Developer Resume', lastUpdated: '2026-08-05', atsScore: 92, data: {} }
];

const mockATSReports = [
  { id: 1, resumeName: 'Cloud Engineer Resume', date: '2026-08-15', score: 86, status: 'Good' },
  { id: 2, resumeName: 'Data Engineer Resume', date: '2026-08-10', score: 78, status: 'Good' },
  { id: 3, resumeName: 'Software Developer Resume', date: '2026-08-05', score: 92, status: 'Excellent' }
];

// Auth APIs
export const loginUser = async (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const normalizedEmail = String(email || '').trim().toLowerCase();
      const trimmedPassword = String(password || '').trim();

      if (!normalizedEmail || !trimmedPassword) {
        reject({ success: false, message: 'Email and password are required' });
        return;
      }

      const demoUser = mockUsers[normalizedEmail] || {
        id: Date.now(),
        name: normalizedEmail.split('@')[0].replace(/[._-]/g, ' '),
        email: normalizedEmail,
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        portfolio: ''
      };

      // Temporary frontend-only demo mode so the app can be explored without a backend.
      if (normalizedEmail.includes('@') && trimmedPassword.length > 0) {
        if (!mockUsers[normalizedEmail]) {
          mockUsers[normalizedEmail] = demoUser;
        }
        resolve({ success: true, user: demoUser, token: 'demo-token-123' });
        return;
      }

      reject({ success: false, message: 'Invalid credentials' });
    }, 400);
  });
};

export const registerUser = async (name, email, password) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockUsers[email] = { id: 2, name, email, phone: '', location: '', linkedin: '', github: '', portfolio: '' };
      resolve({ success: true, message: 'Registration successful' });
    }, 500);
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
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, resumes: mockResumes });
    }, 300);
  });
};

export const getResume = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const resume = mockResumes.find(r => r.id === parseInt(id));
      resolve({ success: true, resume: resume || {} });
    }, 300);
  });
};

export const updateResume = async (id, resumeData) => {
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
export const analyzeJobPosting = async (jobUrl) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        analysis: {
          jobTitle: 'Cloud Engineer',
          company: 'Amazon',
          requiredSkills: ['AWS', 'Python', 'Linux', 'Docker', 'Terraform'],
          technologies: ['AWS', 'Kubernetes', 'Docker', 'Python', 'Terraform'],
          keywords: ['cloud infrastructure', 'deployment', 'scalability', 'monitoring'],
          responsibilities: ['Design and implement cloud infrastructure', 'Manage AWS services', 'Optimize costs']
        }
      });
    }, 1000);
  });
};

export const enhanceResume = async (resumeId, jobAnalysis) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        enhancement: {
          matchScore: 86,
          matchedSkills: ['AWS', 'Python', 'Linux', 'Docker'],
          missingKeywords: ['Terraform', 'Kubernetes'],
          suggestions: [
            { type: 'Professional Summary', priority: 'high', suggestion: 'Add cloud infrastructure keywords' },
            { type: 'Project descriptions', priority: 'medium', suggestion: 'Highlight cloud deployment projects' },
            { type: 'Technical Skills', priority: 'medium', suggestion: 'Add Terraform and Kubernetes' }
          ]
        }
      });
    }, 800);
  });
};

// ATS APIs
export const validateATS = async (resumeFile) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        report: {
          score: 86,
          status: 'Good',
          breakdown: {
            keywordMatch: 88,
            formatting: 90,
            structure: 85,
            readability: 87,
            jobMatch: 82
          },
          good: [
            'Clear section headings',
            'Contact information found',
            'Skills section detected'
          ],
          warnings: [
            'Add more job-specific keywords',
            'Improve project descriptions',
            'Consider adding metrics to achievements'
          ],
          critical: []
        }
      });
    }, 2000);
  });
};

export const getATSReport = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const report = mockATSReports.find(r => r.id === parseInt(id));
      resolve({
        success: true,
        report: report || {
          id: 1,
          resumeName: 'Cloud Engineer Resume',
          date: '2026-08-18',
          score: 86,
          status: 'Good',
          breakdown: {
            keywordMatch: 88,
            formatting: 90,
            structure: 85,
            readability: 87,
            jobMatch: 82
          },
          good: ['Clear section headings', 'Contact information found', 'Skills section detected'],
          warnings: ['Add more job-specific keywords', 'Improve project descriptions'],
          critical: []
        }
      });
    }, 300);
  });
};

export const generateATSReport = async (resumeId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newReport = {
        id: mockATSReports.length + 1,
        resumeName: 'Resume ' + mockATSReports.length,
        date: new Date().toISOString().split('T')[0],
        score: Math.floor(Math.random() * 30) + 70,
        status: 'Good'
      };
      mockATSReports.push(newReport);
      resolve({ success: true, report: newReport });
    }, 2000);
  });
};

export const extractResumeData = async (file) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        extractedData: {
          personalInfo: {
            fullName: 'John Doe',
            email: 'john@example.com',
            phone: '+1 234 567 8900',
            location: 'San Francisco, USA',
            linkedin: 'linkedin.com/in/johndoe',
            github: 'github.com/johndoe',
            portfolio: 'johndoe.dev'
          },
          professionalSummary: 'Experienced software developer with 5+ years in cloud technologies...',
          education: [
            { institution: 'MIT', degree: 'BS', field: 'Computer Science', startYear: 2015, endYear: 2019, cgpa: '3.8' }
          ],
          skills: ['JavaScript', 'Python', 'AWS', 'Docker', 'Kubernetes'],
          experience: [
            { company: 'Tech Corp', role: 'Senior Developer', location: 'San Francisco', startDate: '2021-01', endDate: 'Present', description: 'Led cloud migration...' }
          ],
          projects: [],
          certifications: [],
          achievements: []
        },
        extractedSections: {
          personalInfo: true,
          education: true,
          skills: true,
          experience: true,
          projects: false,
          certifications: false,
          achievements: false
        }
      });
    }, 1500);
  });
};
