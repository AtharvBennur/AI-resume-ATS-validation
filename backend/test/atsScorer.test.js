const test = require('node:test');
const assert = require('node:assert/strict');
const { scoreResumeText } = require('../utils/atsScorer');

test('ATS scoring checks resume sections, contact details, and job keywords', () => {
  const text = `Alex Doe\nalex@example.com | +1 555 123 4567\nProfessional Summary\n${'Experienced software engineer. '.repeat(30)}\nSkills\nJavaScript React AWS\nExperience\nBuilt services used by 2,000 users\nEducation\nBS Computer Science`;
  const report = scoreResumeText(text, 'React AWS Kubernetes');

  assert.equal(report.breakdown.contactDetails, 100);
  assert.equal(report.breakdown.structure, 100);
  assert.equal(report.breakdown.keywordMatch, 67);
  assert.equal(report.status, 'Excellent');
  assert.match(report.warnings.join(' '), /Kubernetes/i);
});

test('ATS scoring flags documents with little extractable text', () => {
  const report = scoreResumeText('Alex');

  assert.equal(report.score < 50, true);
  assert.equal(report.breakdown.keywordMatch, null);
  assert.equal(report.critical.length, 1);
  assert.match(report.critical[0], /selectable text/);
});