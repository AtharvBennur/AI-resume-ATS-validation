import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreResumeData } from '../src/services/atsScore.js';

test('live ATS score starts at zero for an empty resume', () => {
  assert.deepEqual(scoreResumeData({}), {
    score: 0,
    status: 'Start your resume',
    wordCount: 0,
    breakdown: null
  });
});

test('live ATS score responds to resume sections and contact details', () => {
  const result = scoreResumeData({
    personalInfo: {
      fullName: 'Morgan Lee',
      professionalTitle: 'Software Engineer',
      email: 'morgan@example.test',
      phone: '+1 555 201 9988'
    },
    professionalSummary: 'Experienced engineer who developed reliable applications.',
    skills: ['Python', 'React', 'AWS'],
    experience: [{ company: 'Example', role: 'Engineer', description: 'Built services supporting 200 users.' }],
    education: [{ institution: 'University', degree: 'Bachelor of Science' }]
  });

  assert.ok(result.score > 0);
  assert.equal(result.breakdown.contactDetails, 100);
  assert.equal(result.breakdown.structure, 75);
  assert.equal(result.status, 'Needs Improvement');
});
