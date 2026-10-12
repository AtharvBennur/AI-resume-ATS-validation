const mongoose = require('mongoose');
const Resume = require('../models/Resume');

function serialize(resume) {
  return {
    id: resume._id.toString(),
    name: resume.name,
    lastUpdated: resume.updatedAt.toISOString().slice(0, 10),
    atsScore: resume.atsScore,
    data: resume.data
  };
}

function validResumeData(data) {
  return data && typeof data === 'object' && !Array.isArray(data);
}

async function listResumes(req, res, next) {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ updatedAt: -1 });
    return res.json({ success: true, resumes: resumes.map(serialize) });
  } catch (error) {
    return next(error);
  }
}

async function getResume(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Resume not found' });
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    return res.json({ success: true, resume: serialize(resume) });
  } catch (error) {
    return next(error);
  }
}

async function createResume(req, res, next) {
  try {
    const { data } = req.body || {};
    if (!validResumeData(data)) return res.status(400).json({ error: 'Resume data is required' });
    const name = String(data.personalInfo?.fullName || 'Untitled Resume').trim().slice(0, 120);
    const resume = await Resume.create({ user: req.user._id, name, data });
    return res.status(201).json({ success: true, resume: serialize(resume) });
  } catch (error) {
    return next(error);
  }
}

async function updateResume(req, res, next) {
  try {
    const { data } = req.body || {};
    if (!validResumeData(data)) return res.status(400).json({ error: 'Resume data is required' });
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Resume not found' });
    const name = String(data.personalInfo?.fullName || 'Untitled Resume').trim().slice(0, 120);
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name, data, atsScore: 0 },
      { new: true, runValidators: true }
    );
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    return res.json({ success: true, resume: serialize(resume) });
  } catch (error) {
    return next(error);
  }
}

async function deleteResume(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Resume not found' });
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listResumes, getResume, createResume, updateResume, deleteResume };