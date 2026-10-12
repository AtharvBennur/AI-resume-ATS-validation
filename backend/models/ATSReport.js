const mongoose = require('mongoose');

const atsReportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', default: null, index: true },
    resumeName: { type: String, required: true, trim: true, maxlength: 160 },
    score: { type: Number, required: true, min: 0, max: 100 },
    status: { type: String, required: true },
    breakdown: { type: mongoose.Schema.Types.Mixed, required: true },
    good: { type: [String], default: [] },
    warnings: { type: [String], default: [] },
    critical: { type: [String], default: [] },
    wordCount: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ATSReport', atsReportSchema);