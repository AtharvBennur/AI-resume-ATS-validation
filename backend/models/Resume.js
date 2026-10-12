const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    atsScore: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);