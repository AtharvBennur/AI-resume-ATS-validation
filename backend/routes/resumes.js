const express = require('express');
const requireAuth = require('../middleware/auth');
const controller = require('../controllers/resumeController');

const router = express.Router();
router.use(requireAuth);
router.get('/', controller.listResumes);
router.post('/', controller.createResume);
router.get('/:id', controller.getResume);
router.put('/:id', controller.updateResume);
router.delete('/:id', controller.deleteResume);

module.exports = router;