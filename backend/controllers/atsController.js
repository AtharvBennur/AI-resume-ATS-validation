const mongoose = require('mongoose');
const mammoth = require('mammoth');
const { PDFParse } = require('pdf-parse');
const ATSReport = require('../models/ATSReport');
const Resume = require('../models/Resume');
const { scoreResumeText } = require('../utils/atsScorer');
const jobPosting = require('../utils/jobPosting');

function collectResumeText(value) {
  if (typeof value === 'string' || typeof value === 'number') return [String(value)];
  if (Array.isArray(value)) return value.flatMap(collectResumeText);
  if (value && typeof value === 'object') return Object.values(value).flatMap(collectResumeText);
  return [];
}

async function extractText(file) {
  if (file.originalname.toLowerCase().endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  const parser = new PDFParse({ data: file.buffer });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

async function validateATS(req, res, next) {
  if (!req.file) return res.status(400).json({ error: 'Upload a PDF or DOCX resume' });
  if (typeof req.body.jobPostingUrl !== 'string' || !req.body.jobPostingUrl.trim()) {
    return res.status(400).json({ error: 'Enter a job posting URL' });
  }

  try {
    let resume = null;
    if (req.body.resumeId) {
      if (!mongoose.isValidObjectId(req.body.resumeId)) return res.status(400).json({ error: 'Invalid resume ID' });
      resume = await Resume.findOne({ _id: req.body.resumeId, user: req.user._id });
      if (!resume) return res.status(404).json({ error: 'Resume not found' });
    }

    let text;
    try {
      text = await extractText(req.file);
    } catch (error) {
      error.statusCode = 400;
      error.message = 'Could not read this document. Use a valid, text-based PDF or DOCX file.';
      return next(error);
    }
    const posting = await jobPosting.fetchJobPostingText(req.body.jobPostingUrl.trim());
    const result = scoreResumeText(text, posting.text);
    if (result.critical.some((item) => item.includes('Very little readable resume text'))) {
      return res.status(422).json({ error: 'Too little selectable text was found to score this resume. Scanned image-only files need OCR.' });
    }

    const report = await ATSReport.create({
      user: req.user._id,
      resume: resume?._id || null,
      resumeName: resume?.name || req.file.originalname,
      jobPostingUrl: posting.url,
      ...result
    });
    if (resume) {
      resume.atsScore = result.score;
      await resume.save();
    }

    return res.json({
      success: true,
      report: {
        id: report._id.toString(),
        resumeId: resume?._id.toString() || null,
        resumeName: report.resumeName,
        jobPostingUrl: report.jobPostingUrl,
        date: report.createdAt.toISOString().slice(0, 10),
        score: report.score,
        status: report.status,
        breakdown: report.breakdown,
        good: report.good,
        warnings: report.warnings,
        critical: report.critical,
        wordCount: report.wordCount
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function getATSReport(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'ATS report not found' });
    const report = await ATSReport.findOne({ _id: req.params.id, user: req.user._id });
    if (!report) return res.status(404).json({ error: 'ATS report not found' });
    return res.json({
      success: true,
      report: {
        id: report._id.toString(),
        resumeId: report.resume?.toString() || null,
        resumeName: report.resumeName,
        jobPostingUrl: report.jobPostingUrl,
        date: report.createdAt.toISOString().slice(0, 10),
        score: report.score,
        status: report.status,
        breakdown: report.breakdown,
        good: report.good,
        warnings: report.warnings,
        critical: report.critical,
        wordCount: report.wordCount
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function matchResumeToJob(req, res, next) {
  const { resumeId, jobDescription } = req.body || {};
  if (!mongoose.isValidObjectId(resumeId)) return res.status(400).json({ error: 'Select a valid saved resume' });
  if (typeof jobDescription !== 'string' || jobDescription.trim().length < 20 || jobDescription.length > 30000) {
    return res.status(400).json({ error: 'Paste a job description between 20 and 30,000 characters' });
  }

  try {
    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    const comparison = scoreResumeText(collectResumeText(resume.data).join('\n'), jobDescription);
    if (comparison.breakdown.keywordMatch === null) {
      return res.status(400).json({ error: 'The job description does not contain enough searchable terms' });
    }

    return res.json({
      success: true,
      score: comparison.breakdown.keywordMatch,
      matchedKeywords: comparison.matchedKeywords,
      missingKeywords: comparison.missingKeywords,
      status: comparison.breakdown.keywordMatch >= 70 ? 'Strong keyword match' : comparison.breakdown.keywordMatch >= 40 ? 'Partial keyword match' : 'Low keyword match'
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { extractText, getATSReport, matchResumeToJob, validateATS };