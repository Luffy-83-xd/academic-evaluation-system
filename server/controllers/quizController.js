const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');

// @desc   Create a new quiz
// @route  POST /api/quizzes
// @access Private (Proctor)
exports.createQuiz = async (req, res) => {
  try {
    const newQuiz = new Quiz({
      ...req.body,
      createdBy: req.user.id,
    });
    await newQuiz.save();
    res.status(201).json({ success: true, data: newQuiz });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc   Get all quizzes
// @route  GET /api/quizzes
// @access Private
exports.getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find().populate('createdBy', 'name');
        res.status(200).json({ success: true, data: quizzes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc   Get a single quiz by ID (for students to take)
// @route  GET /api/quizzes/:id
// @access Private
exports.getQuizById = async (req, res) => {
    try {
        // Find the quiz but exclude the correct answers
        const quiz = await Quiz.findById(req.params.id).select('-questions.correctAnswer');
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }
        res.status(200).json({ success: true, data: quiz });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc   Submit a quiz
// @route  POST /api/quizzes/submit/:id
// @access Private (Student)
exports.submitQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        if (new Date() > new Date(quiz.deadline)) {
            return res.status(400).json({ success: false, message: 'Deadline has passed for this quiz.' });
        }
        
        const studentAnswers = req.body.answers; // Expects an array of selected option strings
        let score = 0;
        const detailedAnswers = [];

        quiz.questions.forEach((question, index) => {
            const isCorrect = question.correctAnswer === studentAnswers[index];
            if (isCorrect) {
                score++;
            }
            detailedAnswers.push({
                questionText: question.questionText,
                selectedAnswer: studentAnswers[index],
                correctAnswer: question.correctAnswer,
                isCorrect,
            });
        });
        
        const newAttempt = new QuizAttempt({
            quiz: req.params.id,
            student: req.user.id,
            answers: detailedAnswers,
            score,
        });

        await newAttempt.save();
        res.status(201).json({ success: true, data: newAttempt });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
// @desc   Get all attempts for the logged-in student
// @route  GET /api/quizzes/my-attempts
// @access Private (Student)
exports.getMyAttempts = async (req, res) => {
    try {
        const attempts = await QuizAttempt.find({ student: req.user.id })
            .populate('quiz', 'title subject'); // Get quiz title and subject
        res.status(200).json({ success: true, data: attempts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
// @desc   Get a single quiz attempt by its ID
// @route  GET /api/quizzes/my-attempts/:id
// @access Private (Student)
exports.getAttemptById = async (req, res) => {
    try {
        const attempt = await QuizAttempt.findById(req.params.id)
            .populate('quiz', 'title');

        if (!attempt) {
            return res.status(404).json({ success: false, message: 'Quiz attempt not found' });
        }

        // Allow access if the user is a proctor OR if the user is the student who owns the attempt
        if (req.user.role === 'student' && attempt.student.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to view this attempt' });
        }

        res.status(200).json({ success: true, data: attempt });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc   Get all attempts for a specific quiz
// @route  GET /api/quizzes/results/:quizId
// @access Private (Proctor)
exports.getQuizAttempts = async (req, res) => {
    try {
        // Get the IDs of students assigned to this proctor
        const students = await User.find({ assignedProctor: req.user.id }).select('_id');
        const studentIds = students.map(s => s._id);

        // Find only attempts for the specified quiz made by the assigned students
        const attempts = await QuizAttempt.find({ 
            quiz: req.params.quizId,
            student: { $in: studentIds } 
        }).populate('student', 'name email');

        res.status(200).json({ success: true, data: attempts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
// Add other controllers for viewing results later