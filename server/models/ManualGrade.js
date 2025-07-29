const mongoose = require('mongoose');

const ManualGradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  proctor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  testName: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  maxScore: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('ManualGrade', ManualGradeSchema);