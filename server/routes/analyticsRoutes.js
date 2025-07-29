const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authorize');
const { 
    getStudentAnalytics, 
    addManualGrade, 
    updateRemarks 
} = require('../controllers/analyticsController');

router.get('/student/:studentId', protect, getStudentAnalytics);
router.post('/manual-grade', protect, authorize('proctor'), addManualGrade);
router.put('/remarks/:studentId', protect, authorize('proctor'), updateRemarks);

module.exports = router;