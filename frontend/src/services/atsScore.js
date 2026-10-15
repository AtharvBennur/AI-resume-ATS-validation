const sectionPatterns = {
  experience: /^\s*(?:professional\s+)?experience\s*:?\s*$|^\s*employment history\s*:?\s*$/im,
  education: /^\s*education\s*:?\s*$|^\s*academic background\s*:?\s*$/im,
  skills: /^\s*(?:technical\s+)?skills\s*:?\s*$|^\s*core competencies\s*:?\s*$/im
};

const stopWords = new Set([
  'about', 'after', 'also', 'and', 'are', 'can', 'for', 'from', 'has', 'have',
  'into', 'its', 'more', 'our', 'that', 'the', 'their', 'them', 'then', 'this',
  'those', 'through', 'with', 'will', 'you', 'your', 'years', 'year', 'using',
  'work', 'working', 'role', 'responsibilities', 'required', 'requirements'
]);

const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));

const keywordSet = (value) => new Set(
  (value.toLowerCase().match(/[a-z][a-z0-9+#.-]{2,}/g) || [])
    .filter((word) => !stopWords.has(word))
);

function collectText(value) {
  if (typeof value === 'string' || typeof value === 'number') return [String(value)];
  if (Array.isArray(value)) return value.flatMap(collectText);
  if (value && typeof value === 'object') return Object.values(value).flatMap(collectText);
  return [];
}

export function scoreResumeData(data = {}) {
  const personalInfo = data.personalInfo || {};
  const sections = [
    personalInfo.fullName,
    personalInfo.professionalTitle,
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.linkedin,
    personalInfo.github,
    personalInfo.portfolio,
    data.professionalSummary && `Professional Summary\n${data.professionalSummary}`,
    data.experience?.length && `Professional Experience\n${collectText(data.experience).join('\n')}`,
    data.education?.length && `Education\n${collectText(data.education).join('\n')}`,
    data.skills?.length && `Technical Skills\n${data.skills.join(', ')}`,
    data.projects?.length && `Projects\n${collectText(data.projects).join('\n')}`,
    data.certifications?.length && `Certifications\n${collectText(data.certifications).join('\n')}`,
    data.achievements?.length && `Achievements\n${collectText(data.achievements).join('\n')}`
  ].filter(Boolean);
  const normalizedText = sections.join('\n').replace(/[ \t]+/g, ' ').trim();
  const wordCount = normalizedText.match(/[\p{L}\p{N}][\p{L}\p{N}+#.-]*/gu)?.length || 0;

  if (wordCount === 0) {
    return { score: 0, status: 'Start your resume', wordCount: 0, breakdown: null };
  }

  const hasEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(normalizedText);
  const hasPhone = /(?:\+?\d[\d\s().-]{7,}\d)/.test(normalizedText);
  const foundSections = Object.entries(sectionPatterns)
    .filter(([, pattern]) => pattern.test(normalizedText))
    .map(([name]) => name);
  const contactDetails = clampScore((hasEmail ? 50 : 0) + (hasPhone ? 50 : 0));
  const structure = clampScore((foundSections.length / 4) * 100);
  const readability = wordCount < 80 ? 35 : wordCount < 150 ? 65 : wordCount <= 1000 ? 100 : wordCount <= 1500 ? 75 : 50;
  const hasActionVerb = /\b(?:built|created|delivered|designed|developed|improved|increased|implemented|led|launched|managed|reduced|streamlined)\b/i.test(normalizedText);
  const hasMeasurableResult = /\b\d+(?:\.\d+)?\s*%|\b\d+[+]?(?:\s+(?:users|clients|projects|hours|days|weeks|months|years|teams|revenue))\b/i.test(normalizedText);
  const contentQuality = clampScore(40 + (hasActionVerb ? 30 : 0) + (hasMeasurableResult ? 30 : 0));
  const score = wordCount < 80
    ? Math.min(49, clampScore(contactDetails * 0.25 + structure * 0.35 + readability * 0.2 + contentQuality * 0.2))
    : clampScore(contactDetails * 0.25 + structure * 0.35 + readability * 0.2 + contentQuality * 0.2);
  const targetKeywords = keywordSet(normalizedText);

  return {
    score,
    status: score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Fair' : 'Needs Improvement',
    wordCount,
    breakdown: {
      contactDetails,
      structure,
      readability,
      contentQuality,
      searchableTerms: targetKeywords.size
    }
  };
}
