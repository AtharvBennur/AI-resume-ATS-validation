const test = require('node:test');
const assert = require('node:assert/strict');
const { parseResumeText } = require('../utils/resumeParser');

const resumeText = `
Morgan Lee
Software Engineer | AWS Cloud & DevOps
morgan@example.test | +1 555 201 9988 | Canada | linkedin.com/in/morgan-lee

Professional Summary
Software engineer building cloud applications with Python, React, AWS, and Docker. Delivered dependable services for 200 users.

Technical Skills
Cloud: AWS (EC2, S3, Lambda), CloudFormation
Languages: Python, JavaScript, SQL
Tools: Docker, GitHub Actions, Terraform

Certifications
AWS Certified Cloud Practitioner | Verify
Demonstrates knowledge of core cloud services.
AWS Certified AI Practitioner | Verify
Demonstrates knowledge of responsible generative AI.

Professional Experience
Example Cloud Co Sep 2024 - Present
Cloud Engineering Intern
Built a deployment pipeline used by 200 users.
Key Contributions
Implemented automated releases with GitHub Actions.
Example College, Toronto
Coding Club Secretary
Led a club of 100 students and organized technical events.

Projects
Cloud Migration Platform | Freelance | GitHub
Designed APIs with Python, Flask, and AWS Lambda.
AI Study Planner | Personal
Created a React application that supports student planning.

Achievements
2nd Place - Regional Hackathon
Club leadership recognition

Education
Bachelor of Computer Applications (BCA) 2023 - 2026
Example University | CGPA: 9.1
Example Senior Secondary School
12th (Commerce): Example Senior College, Toronto 87.8%
10th: Example School, Toronto 80%
`;

test('resume parser maps a multi-section resume into builder data', () => {
  const { extractedData, extractedSections } = parseResumeText(resumeText);

  assert.equal(extractedData.personalInfo.fullName, 'Morgan Lee');
  assert.equal(extractedData.personalInfo.email, 'morgan@example.test');
  assert.equal(extractedData.personalInfo.location, 'Canada');
  assert.match(extractedData.professionalSummary, /cloud applications/);
  assert.ok(extractedData.skills.includes('Python'));
  assert.equal(extractedData.certifications.length, 2);
  assert.equal(extractedData.experience.length, 2);
  assert.equal(extractedData.experience[0].company, 'Example Cloud Co');
  assert.equal(extractedData.projects.length, 2);
  assert.equal(extractedData.achievements.length, 2);
    assert.equal(extractedData.education.length, 3);
    assert.equal(extractedData.education[1].degree, '12th (Commerce)');
    assert.equal(extractedData.education[1].institution, 'Example Senior College, Toronto');
    assert.equal(extractedData.education[1].cgpa, '87.8%');
  assert.ok(Object.values(extractedSections).every(Boolean));
});

test('resume parser rejects empty or non-readable content', () => {
  assert.throws(() => parseResumeText('   '), /No readable text/);
});