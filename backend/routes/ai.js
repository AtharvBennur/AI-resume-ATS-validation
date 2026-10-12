const express = require('express');
const multer = require('multer');
const { rewriteSection } = require('../controllers/aiController');
const { getATSReport, matchResumeToJob, validateATS } = require('../controllers/atsController');
const { importResume } = require('../controllers/resumeImportController');
const requireAuth = require('../middleware/auth');

const router = express.Router();
const uploadResume = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (req, file, callback) => {
		const filename = file.originalname.toLowerCase();
		if (filename.endsWith('.pdf') || filename.endsWith('.docx')) return callback(null, true);
		const error = new Error('Upload a PDF or DOCX resume');
		error.statusCode = 400;
		return callback(error);
	}
});

function receiveResume(req, res, next) {
	uploadResume.single('resume')(req, res, (error) => {
		if (error) {
			const statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : (error.statusCode || 400);
			return res.status(statusCode).json({ error: statusCode === 413 ? 'Resume files must be 5 MB or smaller' : error.message });
		}
		return next();
	});
}

router.post('/rewrite', requireAuth, rewriteSection);
router.post('/resume/import', requireAuth, receiveResume, importResume);
router.post('/ats/validate', requireAuth, receiveResume, validateATS);
router.get('/ats/reports/:id', requireAuth, getATSReport);
router.post('/job-match', requireAuth, matchResumeToJob);

module.exports = router;