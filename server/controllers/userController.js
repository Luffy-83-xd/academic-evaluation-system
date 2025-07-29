const User = require('../models/User');

exports.getAllStudents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Find only students assigned to the logged-in proctor
        const assignedStudentsQuery = { role: 'student', assignedProctor: req.user.id };

        const totalStudents = await User.countDocuments(assignedStudentsQuery);
        const totalPages = Math.ceil(totalStudents / limit);

        const students = await User.find(assignedStudentsQuery)
            .select('name email department')
            .sort({ name: 1 })
            .limit(limit)
            .skip(skip);

        res.status(200).json({
            success: true,
            data: students,
            page,
            pages: totalPages,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc   Get all users with the role of 'proctor'
// @route  GET /api/users/proctors
// @access Private (Student)
exports.getAllProctors = async (req, res) => {
    try {
        const proctors = await User.find({ role: 'proctor' }).select('name email');
        res.status(200).json({ success: true, data: proctors });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Add these new functions to userController.js

// @desc   Get current logged-in user's profile
// @route  GET /api/users/me
// @access Private
exports.getCurrentUser = async (req, res) => {
    // We need to find the user again to use populate
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('assignedProctor', 'name email'); // Add this line

    res.status(200).json({ success: true, data: user });
};

// @desc   Update user profile details
// @route  PUT /api/users/profile
// @access Private
exports.updateUserProfile = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, {
            new: true,
            runValidators: true
        }).select('-password');
        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc   Upload user avatar
// @route  PUT /api/users/avatar
// @access Private
exports.uploadAvatar = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { avatar: req.file.path }, // Save the path to the file
            { new: true }
        ).select('-password');
        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};