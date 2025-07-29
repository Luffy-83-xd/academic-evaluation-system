const QuizAttempt = require('../models/QuizAttempt');
const Project = require('../models/Project');
const ManualGrade = require('../models/ManualGrade');
const User = require('../models/User');

// @desc   Get all performance data for a single student
// @route  GET /api/analytics/student/:studentId
// @access Private
exports.getStudentAnalytics = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        const quizAttempts = await QuizAttempt.find({ student: studentId }).populate('quiz', 'title');
        const projects = await Project.find({ student: studentId });
        const manualGrades = await ManualGrade.find({ student: studentId });

        const formattedData = [
            ...quizAttempts.map(a => ({
                type: 'Quiz',
                title: a.quiz.title,
                grade: `${a.score} / ${a.answers.length}`,
                date: a.submittedAt
            })),
            ...projects.map(p => ({
                type: 'Project',
                title: p.title,
                grade: p.grade,
                date: p.updatedAt
            })),
            ...manualGrades.map(g => ({
                type: 'Manual Grade',
                title: g.testName,
                grade: `${g.score} / ${g.maxScore}`,
                date: g.createdAt
            }))
        ];

        // Sort by date descending
        formattedData.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Get remarks
        const student = await User.findById(studentId).select('remarks');

        res.status(200).json({ 
            success: true, 
            data: formattedData,
            remarks: student.remarks
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc   Proctor adds a manual grade for a student
// @route  POST /api/analytics/manual-grade
// @access Private (Proctor)
exports.addManualGrade = async (req, res) => {
    try {
        const newGrade = new ManualGrade({
            ...req.body,
            proctor: req.user.id,
        });
        await newGrade.save();
        res.status(201).json({ success: true, data: newGrade });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc   Proctor adds/updates remarks for a student
// @route  PUT /api/analytics/remarks/:studentId
// @access Private (Proctor)
exports.updateRemarks = async (req, res) => {
    try {
        const student = await User.findByIdAndUpdate(
            req.params.studentId,
            { remarks: req.body.remarks },
            { new: true }
        );
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
        res.status(200).json({ success: true, message: 'Remarks updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};