const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authorize');
const multer = require('multer');
const { 
    getAllStudents, 
    getAllProctors,
    getCurrentUser,
    updateUserProfile,
    uploadAvatar 
} = require('../controllers/userController');

// Multer configuration for avatar uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/avatars/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = req.user.id + '-' + Date.now() + '.' + file.mimetype.split('/')[1];
      cb(null, uniqueSuffix);
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

// Existing Routes
router.get('/students', protect, authorize('proctor'), getAllStudents);
router.get('/proctors', protect, authorize('student'), getAllProctors);

// New Routes
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateUserProfile);
router.put('/avatar', protect, upload.single('avatar'), uploadAvatar);


module.exports = router;