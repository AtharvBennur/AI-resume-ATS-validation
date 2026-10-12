import test from 'node:test';
import assert from 'node:assert/strict';
import { createResumePdf } from '../src/services/resumePdf.js';

test('resume PDF uses the fixed section order and paginates long content', async () => {
  const pdf = await createResumePdf({
    personalInfo: { fullName: 'Test Applicant', professionalTitle: 'Cloud Engineer', email: 'test@example.com' },
    professionalSummary: 'Cloud engineer. '.repeat(450),
    skills: ['AWS', 'Python'],
    certifications: [{ name: 'Cloud Practitioner', issuer: 'AWS', date: '2026' }],
    experience: [{ role: 'Intern', company: 'Example Co', description: 'Built deployments.' }],
    projects: [{ name: 'Project One', description: 'Created a cloud platform.' }],
    achievements: ['Hackathon finalist'],
    education: [{ degree: 'BCA', institution: 'Example College', startYear: '2024', endYear: '2027' }]
  });
  const output = pdf.output();
  const headings = [
    'PROFESSIONAL SUMMARY', 'TECHNICAL SKILLS', 'CERTIFICATIONS',
    'PROFESSIONAL EXPERIENCE', 'PROJECTS', 'ACHIEVEMENTS', 'EDUCATION'
  ];
  const headingPositions = headings.map((heading) => output.indexOf(heading));

  assert.match(output, /^%PDF-/);
  assert.ok(headingPositions.every((position) => position >= 0));
  assert.deepEqual(headingPositions, [...headingPositions].sort((left, right) => left - right));
  assert.ok(pdf.getNumberOfPages() > 1);
});