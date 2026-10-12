const sectionDefinitions = [
  { key: 'summary', pattern: /^(?:professional\s+)?summary\s*:?$/i },
  { key: 'skills', pattern: /^(?:technical\s+)?skills\s*:?$|^core competencies\s*:?$/i },
  { key: 'certifications', pattern: /^certifications?\s*:?$/i },
  { key: 'experience', pattern: /^(?:professional\s+)?experience\s*:?$|^employment history\s*:?$/i },
  { key: 'projects', pattern: /^projects\s*:?$/i },
  { key: 'achievements', pattern: /^(?:achievements|awards|honors)\s*:?$/i },
  { key: 'education', pattern: /^education\s*:?$|^academic background\s*:?$/i }
];

const educationPattern = /\b(?:bachelor|master|doctor|ph\.?d|b\.?\s?c\.?\s?a\.?|b\.?\s?tech|m\.?\s?tech|b\.?\s?sc|m\.?\s?sc|b\.?\s?com|m\.?\s?com|diploma|\d{1,2}(?:st|nd|rd|th))\b/i;
const monthPattern = '(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';
const dateRangePattern = new RegExp(`\\b(${monthPattern}\\s+\\d{4}|\\d{4})\\s*(?:-|–|to)\\s*((?:${monthPattern}\\s+)?(?:\\d{4}|present|current))\\b`, 'i');

function cleanLine(line) {
  return line
    .replace(/^[\s\u2022\u25aa\u25cf\-*]+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeLines(text) {
  return String(text || '')
    .replace(/\r\n?/g, '\n')
    .replace(/\f/g, '\n')
    .replace(/<PARSED TEXT FOR PAGE[^>]*>/gi, '\n')
    .replace(/\u00a0/g, ' ')
    .split('\n')
    .map(cleanLine)
    .filter((line) => line && !/^\d+\s*\/\s*\d+$/.test(line));
}

function splitSections(lines) {
  const sections = Object.fromEntries(sectionDefinitions.map(({ key }) => [key, []]));
  const header = [];
  let activeSection = null;

  for (const line of lines) {
    const definition = sectionDefinitions.find(({ pattern }) => pattern.test(line));
    if (definition) {
      activeSection = definition.key;
      continue;
    }
    if (activeSection) sections[activeSection].push(line);
    else header.push(line);
  }

  return { header, sections };
}

function splitItems(lines) {
  return lines
    .flatMap((line) => line.split(/[,;\u2022]+/))
    .map((item) => item.replace(/^[^:]+:\s*/, '').trim())
    .filter(Boolean);
}

function uniqueItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseEducation(lines) {
  const entries = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!educationPattern.test(line)) continue;

    const dateMatch = line.match(/\b((?:19|20)\d{2})\s*(?:-|–|to)\s*((?:19|20)\d{2}|present|current)\b/i);
    const colonIndex = line.indexOf(':');
    const inlineInstitution = colonIndex > -1 && educationPattern.test(line.slice(0, colonIndex))
      ? line.slice(colonIndex + 1).trim()
      : '';
    const degreeText = inlineInstitution ? line.slice(0, colonIndex) : line;
    const resultMatch = line.match(/\b(?:CGPA|GPA|score|percentage)\s*:?\s*([\d.]+\s*%?)|([\d.]+\s*%)\s*$/i);
    const degree = degreeText.replace(dateRangePattern, '').replace(/\b(?:CGPA|GPA|score|percentage)\s*:?\s*[\d.]+\s*%?/i, '').replace(/\s+[\d.]+\s*%\s*$/, '').trim();
    const nextLine = lines[index + 1] || '';
    const institution = inlineInstitution || (nextLine && !educationPattern.test(nextLine) ? nextLine : '');
    const institutionResult = institution.match(/\b(?:CGPA|GPA|score|percentage)\s*:?\s*([\d.]+\s*%?)/i);

    entries.push({
      institution: institution.replace(/\s*\|\s*(?:CGPA|GPA).*$/i, '').replace(/\s+[\d.]+\s*%\s*$/, '').trim(),
      degree,
      field: (degree.match(/\(([^)]+)\)/) || [])[1] || '',
      startYear: dateMatch?.[1] || '',
      endYear: dateMatch?.[2] || '',
      cgpa: resultMatch?.[1] || resultMatch?.[2] || institutionResult?.[1] || institution.match(/([\d.]+\s*%)\s*$/)?.[1] || ''
    });
    if (institution && !inlineInstitution) index += 1;
  }

  return entries;
}

function parseCertifications(lines) {
  const entries = [];
  let current = null;

  for (const line of lines) {
    if (/^credly\s+profile\s*:/i.test(line)) continue;
    if (/\b(?:certified|certificate)\b/i.test(line) && !/^verify$/i.test(line)) {
      if (current) entries.push(current);
      current = {
        name: line.replace(/\s*\|\s*verify\s*$/i, '').trim(),
        issuer: /^aws\b/i.test(line) ? 'AWS' : '',
        date: '',
        description: ''
      };
    } else if (current && !/^verify$/i.test(line)) {
      current.description = [current.description, line].filter(Boolean).join(' ');
    }
  }

  if (current) entries.push(current);
  if (entries.length) return entries;
  return lines.filter((line) => !/^credly\s+profile\s*:/i.test(line)).map((name) => ({ name, issuer: '', date: '', description: '' }));
}

function findExperienceStarts(lines) {
  const starts = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (dateRangePattern.test(lines[index])) starts.push(index);
    if (index + 2 >= lines.length || starts.includes(index)) continue;

    const organization = lines[index];
    const role = lines[index + 1];
    const description = lines[index + 2];
    const shortHeader = (value) => value.split(/\s+/).length <= 9 && !/[.!?]$/.test(value);
    if (shortHeader(organization) && shortHeader(role) && description.split(/\s+/).length > 9) starts.push(index);
  }
  return [...new Set(starts)].sort((left, right) => left - right);
}

function parseExperience(lines) {
  const starts = findExperienceStarts(lines);
  if (!starts.length && lines.length) starts.push(0);

  return starts.map((start, position) => {
    const end = starts[position + 1] ?? lines.length;
    const block = lines.slice(start, end).filter((line) => !/^key contributions\s*:?$/i.test(line));
    const first = block[0] || '';
    const dateMatch = first.match(dateRangePattern);
    const company = dateMatch ? first.replace(dateMatch[0], '').trim() : first;
    const role = dateMatch ? (block[1] || '') : (block[1] || '');
    const description = block.slice(2).join(' ').trim();
    return {
      company,
      role,
      location: '',
      startDate: dateMatch?.[1] || '',
      endDate: dateMatch?.[2] || '',
      description: description || (dateMatch ? role : block.slice(1).join(' '))
    };
  }).filter((entry) => entry.company || entry.role || entry.description);
}

function parseProjects(lines) {
  const starts = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (/\s\|\s/.test(lines[index]) && !/https?:\/\//i.test(lines[index])) starts.push(index);
  }
  if (!starts.length && lines.length) starts.push(0);

  return starts.map((start, position) => {
    const end = starts[position + 1] ?? lines.length;
    const block = lines.slice(start, end);
    const [name = '', ...descriptionLines] = block;
    return { name, description: descriptionLines.join(' ').trim(), technologies: '', githubLink: '', liveLink: '' };
  }).filter((project) => project.name || project.description);
}

function parseResumeText(text) {
  const lines = normalizeLines(text);
  if (!lines.length) throw new Error('No readable text was found in the uploaded resume');

  const { header, sections } = splitSections(lines);
  const completeText = lines.join('\n');
  const contactLine = header.find((line) => /@|\+?\d[\d\s().-]{7,}\d/.test(line)) || '';
  const contactParts = contactLine.split('|').map((part) => part.trim());
  const email = (completeText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [])[0] || '';
  const phone = (completeText.match(/\+?\d[\d\s().-]{7,}\d/) || [])[0]?.trim() || '';
  const linkedin = (completeText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s|,]+/i) || [])[0] || '';
  const github = (completeText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s|,]+/i) || [])[0] || '';
  const portfolio = (completeText.match(/(?:https?:\/\/)?(?:www\.)?[\w-]+\.(?:dev|com|io|org|net)(?:\/[^\s|,]*)?/i) || [])[0] || '';
  const location = contactParts.find((part) => part && part !== email && !/\+?\d[\d\s().-]{7,}\d/.test(part) && !/linkedin|github|https?:\/\//i.test(part)) || '';
  const nameLine = header.find((line) => !/@|linkedin|github|https?:\/\//i.test(line) && line.split(/\s+/).length <= 5 && !dateRangePattern.test(line)) || '';
  const nameIndex = header.indexOf(nameLine);
  const title = header.slice(nameIndex + 1).find((line) => line && line !== contactLine && !/@|linkedin|github|https?:\/\//i.test(line)) || '';
  const skills = uniqueItems(splitItems(sections.skills));
  const education = parseEducation(sections.education);
  const experience = parseExperience(sections.experience);
  const projects = parseProjects(sections.projects);
  const certifications = parseCertifications(sections.certifications);
  const achievements = uniqueItems(sections.achievements.map((line) => line.replace(/\s{2,}/g, ' ').trim()));

  const extractedData = {
    personalInfo: { fullName: nameLine, professionalTitle: title, email, phone, location, linkedin, github, portfolio },
    professionalSummary: sections.summary.join(' ').trim(),
    education,
    skills,
    experience,
    projects,
    certifications,
    achievements
  };
  const extractedSections = {
    personalInfo: Boolean(nameLine || email || phone),
    professionalSummary: Boolean(extractedData.professionalSummary),
    education: education.length > 0,
    skills: skills.length > 0,
    experience: experience.length > 0,
    projects: projects.length > 0,
    certifications: certifications.length > 0,
    achievements: achievements.length > 0
  };

  return { extractedData, extractedSections };
}

module.exports = { parseResumeText };