const { extractText } = require('./atsController');
const { parseResumeText } = require('../utils/resumeParser');

async function importResume(req, res, next) {
  if (!req.file) return res.status(400).json({ error: 'Upload a PDF or DOCX resume' });

  try {
    const text = await extractText(req.file);
    const parsed = parseResumeText(text);
    return res.json({ success: true, ...parsed });
  } catch (error) {
    error.statusCode = 422;
    error.message = error.message.startsWith('No readable text')
      ? 'No selectable text was found. Scanned image-only resumes need OCR before import.'
      : 'Could not parse this resume. Use a valid, text-based PDF or DOCX file.';
    return next(error);
  }
}

module.exports = { importResume };