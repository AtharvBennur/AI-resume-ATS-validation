const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const ATSReport = require('../models/ATSReport');
const Resume = require('../models/Resume');
const User = require('../models/User');
const jobPosting = require('../utils/jobPosting');

process.env.JWT_SECRET = 'document-flow-test-secret';
const app = require('../server');

function createPdf(lines) {
  const escapedLines = lines.map((line) => line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)'));
  const content = `BT\n/F1 10 Tf\n18 TL\n50 750 Td\n${escapedLines.map((line) => `(${line}) Tj T*`).join('\n')}\nET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;
  pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, 'ascii');
}

const pdfBuffer = createPdf([
  'Morgan Lee',
  'Software Engineer | Cloud Infrastructure',
  'morgan@example.test | +1 555 201 9988 | Canada',
  'Professional Summary',
  ...Array.from({ length: 12 }, () => 'Experienced engineer built and deployed reliable applications with Python, React, AWS, Docker, and Terraform for 200 users.'),
  'Technical Skills',
  'AWS, Python, React, Docker, Terraform, GitHub Actions',
  'Certifications',
  'AWS Certified Cloud Practitioner',
  'Professional Experience',
  'Example Cloud Company Sep 2024 - Present',
  'Cloud Engineering Intern',
  'Implemented a deployment pipeline that supports 200 users.',
  'Projects',
  'Cloud Migration Platform | Freelance | GitHub',
  'Designed secure services using AWS Lambda and Terraform.',
  'Achievements',
  'Regional Hackathon finalist',
  'Education',
  'Bachelor of Computer Applications 2023 - 2026',
  'Example University | CGPA: 9.1'
]);

test('PDF import parses actual document text into resume sections', async () => {
  const originalFindById = User.findById;
  User.findById = async (id) => ({ _id: id });
  const token = jwt.sign({ sub: '507f1f77bcf86cd799439011' }, process.env.JWT_SECRET);
  try {
    const response = await request(app)
      .post('/api/ai/resume/import')
      .set('Authorization', `Bearer ${token}`)
      .attach('resume', pdfBuffer, { filename: 'morgan-resume.pdf', contentType: 'application/pdf' });

    assert.equal(response.status, 200, JSON.stringify(response.body));
    assert.equal(response.body.extractedData.personalInfo.fullName, 'Morgan Lee');
    assert.equal(response.body.extractedData.personalInfo.email, 'morgan@example.test');
    assert.match(response.body.extractedData.professionalSummary, /Experienced engineer built/);
    assert.ok(response.body.extractedData.skills.includes('Python'));
    assert.equal(response.body.extractedData.projects[0].name, 'Cloud Migration Platform | Freelance | GitHub');
  } finally {
    User.findById = originalFindById;
  }
});

test('ATS upload stores a real score, updates the selected resume, and returns persisted report', async () => {
  const originalFindById = User.findById;
  const originalResumeFindOne = Resume.findOne;
  const originalReportCreate = ATSReport.create;
  const originalReportFindOne = ATSReport.findOne;
  const originalFetchJobPostingText = jobPosting.fetchJobPostingText;
  const userId = '507f1f77bcf86cd799439011';
  const resumeId = '507f191e810c19729de860ea';
  const reportId = '507f1f77bcf86cd799439012';
  const savedResume = {
    _id: resumeId,
    name: 'Morgan Lee Resume',
    atsScore: 0,
    async save() { this.saved = true; }
  };
  let savedReport;

  User.findById = async (id) => ({ _id: id });
  Resume.findOne = async () => savedResume;
  ATSReport.create = async (data) => {
    savedReport = { ...data, _id: { toString: () => reportId }, createdAt: new Date('2026-10-12T00:00:00Z') };
    return savedReport;
  };
  ATSReport.findOne = async () => savedReport;
  jobPosting.fetchJobPostingText = async () => ({
    text: 'Python React AWS Docker Kubernetes',
    url: 'https://jobs.example.test/software-engineer'
  });
  const token = jwt.sign({ sub: userId }, process.env.JWT_SECRET);

  try {
    const response = await request(app)
      .post('/api/ai/ats/validate')
      .set('Authorization', `Bearer ${token}`)
      .field('resumeId', resumeId)
      .field('jobPostingUrl', 'https://jobs.example.test/software-engineer')
      .attach('resume', pdfBuffer, { filename: 'morgan-resume.pdf', contentType: 'application/pdf' });

    assert.equal(response.status, 200, JSON.stringify(response.body));
    assert.equal(response.body.report.id, reportId);
    assert.ok(response.body.report.score > 0 && response.body.report.score <= 100);
    assert.equal(response.body.report.breakdown.keywordMatch, 80);
    assert.equal(response.body.report.jobPostingUrl, 'https://jobs.example.test/software-engineer');
    assert.equal(savedResume.atsScore, response.body.report.score);
    assert.equal(savedResume.saved, true);

    const reportResponse = await request(app)
      .get(`/api/ai/ats/reports/${reportId}`)
      .set('Authorization', `Bearer ${token}`);
    assert.equal(reportResponse.status, 200);
    assert.equal(reportResponse.body.report.score, response.body.report.score);
    assert.equal(reportResponse.body.report.resumeName, 'Morgan Lee Resume');
    assert.equal(reportResponse.body.report.jobPostingUrl, 'https://jobs.example.test/software-engineer');
  } finally {
    User.findById = originalFindById;
    Resume.findOne = originalResumeFindOne;
    ATSReport.create = originalReportCreate;
    ATSReport.findOne = originalReportFindOne;
    jobPosting.fetchJobPostingText = originalFetchJobPostingText;
  }
});

test('job match compares actual saved resume text with the supplied description', async () => {
  const originalFindById = User.findById;
  const originalResumeFindOne = Resume.findOne;
  const userId = '507f1f77bcf86cd799439011';
  const resumeId = '507f191e810c19729de860ea';
  User.findById = async (id) => ({ _id: id });
  Resume.findOne = async () => ({
    _id: resumeId,
    data: { skills: ['Python', 'React', 'AWS'], experience: [{ description: 'Built Docker services.' }] }
  });
  const token = jwt.sign({ sub: userId }, process.env.JWT_SECRET);

  try {
    const response = await request(app)
      .post('/api/ai/job-match')
      .set('Authorization', `Bearer ${token}`)
      .send({ resumeId, jobDescription: 'Python React AWS Kubernetes Docker' });

    assert.equal(response.status, 200);
    assert.equal(response.body.score, 80);
    assert.deepEqual(response.body.matchedKeywords.sort(), ['aws', 'docker', 'python', 'react']);
    assert.deepEqual(response.body.missingKeywords, ['kubernetes']);
  } finally {
    User.findById = originalFindById;
    Resume.findOne = originalResumeFindOne;
  }
});