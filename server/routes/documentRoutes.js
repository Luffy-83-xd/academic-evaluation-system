const express = require('express');
const router = express.Router();
// Import the new functions
const { 
  uploadDocument, 
  getStudentDocuments,
  getAllDocuments,
  updateDocumentStatus,
  deleteDocument
} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/documents/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Define Routes
router.post('/upload', protect, upload.single('document'), uploadDocument);
router.get('/student', protect, getStudentDocuments);

// Add the new routes
router.get('/', protect, getAllDocuments); // For proctors
router.put('/status/:id', protect, updateDocumentStatus); // For proctors
router.delete('/:id', protect, deleteDocument); // For students

module.exports = router;