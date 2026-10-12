const sectionPatterns = {
  summary: /^\s*(?:professional\s+)?summary\s*:?\s*$/im,
  experience: /^\s*(?:professional\s+)?experience\s*:?\s*$|^\s*employment history\s*:?\s*$/im,
  education: /^\s*education\s*:?\s*$|^\s*academic background\s*:?\s*$/im,
  skills: /^\s*(?:technical\s+)?skills\s*:?\s*$|^\s*core competencies\s*:?\s*$/im,
  projects: /^\s*projects\s*:?\s*$/im
};

const stopWords = new Set([
  'about', 'after', 'also', 'and', 'are', 'can', 'for', 'from', 'has', 'have',
  'into', 'its', 'more', 'our', 'that', 'the', 'their', 'them', 'then', 'this',
  'those', 'through', 'with', 'will', 'you', 'your', 'years', 'year', 'using',
  'work', 'working', 'role', 'responsibilities', 'required', 'requirements'
]);

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function keywordSet(value) {
  return new Set((value.toLowerCase().match(/[a-z][a-z0-9+#.-]{2,}/g) || [])
    .filter((word) => !stopWords.has(word)));
}

function scoreResumeText(text, jobDescription = '') {
  const sourceText = String(text || '').replace(/\r\n?/g, '\n');
  const normalizedText = sourceText.replace(/\s+/g, ' ').trim();
  const words = normalizedText.match(/[\p{L}\p{N}][\p{L}\p{N}+#.-]*/gu) || [];
  const wordCount = words.length;
  const hasEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(normalizedText);
  const hasPhone = /(?:\+?\d[\d\s().-]{7,}\d)/.test(normalizedText);
  const sections = Object.entries(sectionPatterns)
    .filter(([, pattern]) => pattern.test(sourceText))
    .map(([name]) => name);
  const missingSections = ['experience', 'education', 'skills']
    .filter((section) => !sections.includes(section));

  const contactDetails = clampScore((hasEmail ? 50 : 0) + (hasPhone ? 50 : 0));
  const structure = clampScore((sections.filter((section) => section !== 'projects').length / 4) * 100);
  const readability = wordCount < 80
    ? 35
    : wordCount < 150
      ? 65
      : wordCount <= 1000
        ? 100
        : wordCount <= 1500
          ? 75
          : 50;
  const hasActionVerb = /\b(?:built|created|delivered|designed|developed|improved|increased|implemented|led|launched|managed|reduced|streamlined)\b/i.test(normalizedText);
  const hasMeasurableResult = /\b\d+(?:\.\d+)?\s*%|\b\d+[+]?(?:\s+(?:users|clients|projects|hours|days|weeks|months|years|teams|revenue))\b/i.test(normalizedText);
  const contentQuality = clampScore(40 + (hasActionVerb ? 30 : 0) + (hasMeasurableResult ? 30 : 0));

  let keywordMatch = null;
  let matchedKeywords = [];
  let missingKeywords = [];
  const targetKeywords = keywordSet(String(jobDescription || ''));
  if (targetKeywords.size > 0) {
    const resumeKeywords = keywordSet(normalizedText);
    matchedKeywords = [...targetKeywords].filter((keyword) => resumeKeywords.has(keyword));
    keywordMatch = clampScore((matchedKeywords.length / targetKeywords.size) * 100);
    missingKeywords = [...targetKeywords].filter((keyword) => !resumeKeywords.has(keyword)).slice(0, 8);
  }

  const calculatedScore = keywordMatch === null
    ? clampScore(contactDetails * 0.25 + structure * 0.35 + readability * 0.2 + contentQuality * 0.2)
    : clampScore(contactDetails * 0.2 + structure * 0.3 + readability * 0.15 + contentQuality * 0.15 + keywordMatch * 0.2);
  const score = wordCount < 80 ? Math.min(49, calculatedScore) : calculatedScore;

  const good = [];
  const warnings = [];
  const critical = [];
  if (hasEmail) good.push('Email address found.');
  else warnings.push('Add a clearly labeled email address.');
  if (hasPhone) good.push('Phone number found.');
  else warnings.push('Add a phone number.');
  if (sections.includes('experience')) good.push('Experience section found.');
  if (sections.includes('education')) good.push('Education section found.');
  if (sections.includes('skills')) good.push('Skills section found.');
  if (missingSections.length) warnings.push(`Add or label these sections: ${missingSections.join(', ')}.`);
  if (wordCount < 80) critical.push('Very little readable resume text was extracted. Check that the document contains selectable text.');
  else if (wordCount > 1500) warnings.push('The resume is lengthy; consider focusing it on the most relevant experience.');
  if (!hasMeasurableResult) warnings.push('Add measurable outcomes where accurate.');
  if (missingKeywords.length) warnings.push(`Consider reflecting relevant job terms where truthful: ${missingKeywords.join(', ')}.`);
  if (keywordMatch === null) warnings.push('Add a job description to calculate a job-specific keyword match.');

  return {
    score,
    status: score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Fair' : 'Needs Improvement',
    breakdown: { contactDetails, structure, readability, contentQuality, keywordMatch },
    good,
    warnings,
    critical,
    wordCount,
    matchedKeywords,
    missingKeywords
  };
}

module.exports = { scoreResumeText };