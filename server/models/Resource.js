const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
  },
  uploadedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  sourceProject: {
    type: Boolean,
    default: false,
  },
  originalAuthor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  }
}, { timestamps: true });

module.exports = mongoose.model('Resource', ResourceSchema);