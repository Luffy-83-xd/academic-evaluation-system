const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a project title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  filePath: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Submitted', 'Checked'],
    default: 'Submitted',
  },
  grade: {
    type: String,
    default: 'Not Graded',
  },
  feedback: {
    type: String,
    default: '',
  },
  isResource: { // For when proctor marks it as a resource for others
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);