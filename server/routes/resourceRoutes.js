const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authorize');
const multer = require('multer');
const {
    uploadResource,
    getAllResources,
    deleteResource
} = require('../controllers/resourceController');

// Configure multer for resource uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/resources/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Define Routes
router.route('/')
    .get(protect, getAllResources)
    .post(protect, authorize('proctor'), upload.single('resourceFile'), uploadResource);

router.route('/:id')
    .delete(protect, authorize('proctor'), deleteResource);

module.exports = router;