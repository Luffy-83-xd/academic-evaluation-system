const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authorize');
const {
    createQuiz,
    getAllQuizzes,
    getQuizById,
    submitQuiz,
    getMyAttempts,
    getAttemptById,
    getQuizAttempts
} = require('../controllers/quizController');

// Proctor Routes
router.post('/', protect, authorize('proctor'), createQuiz);
router.get('/results/:quizId', protect, authorize('proctor'), getQuizAttempts);

// Student & Proctor Routes
router.get('/', protect, getAllQuizzes);


// Student Routes
router.get('/my-attempts/all', protect, authorize('student'), getMyAttempts);
router.post('/submit/:id', protect, authorize('student'), submitQuiz);
router.get('/my-attempts/:id', protect, authorize('student', 'proctor'), getAttemptById);

// This general route with a parameter MUST be last
router.get('/:id', protect, getQuizById);

module.exports = router;