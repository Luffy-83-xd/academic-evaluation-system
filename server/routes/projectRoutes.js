const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authorize');
const multer = require('multer');
const {
    uploadProject,
    getStudentProjects,
    getAllProjects,
    gradeProject
} = require('../controllers/projectController');

// Configure multer for project uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/projects/'); // New directory for projects
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Define Routes
router.post('/upload', protect, authorize('student'), upload.single('projectFile'), uploadProject);
router.get('/student', protect, authorize('student'), getStudentProjects);
router.get('/', protect, authorize('proctor'), getAllProjects);
router.put('/grade/:id', protect, authorize('proctor'), gradeProject);

module.exports = router;