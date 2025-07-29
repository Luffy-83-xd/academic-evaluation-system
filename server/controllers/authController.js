const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc   Register a new user (for you to add users via Postman)
// @route  POST /api/auth/register
// @access Public (but should be protected in a real app)
exports.registerUser = async (req, res) => {
    try {
        // You'll send all the user data in the request body
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({
            success: true,
            message: `${req.body.role} registered successfully!`,
            user: { id: newUser._id, name: newUser.name, role: newUser.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc   Login a user
// @route  POST /api/auth/login
// @access Public
exports.loginUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // 1. Check if user exists with the given email and role
        const user = await User.findOne({ email, role });
        if (!user) {
            return res.status(401).json({ success: false, message: `Login Error: No ${role} found with that email.` });
        }

        // 2. Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Login Error: Incorrect password.' });
        }

        // 3. Create JWT Token
        const payload = {
            id: user._id,
            name: user.name,
            role: user.role,
            avatar: user.avatar
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }); // Token expires in 1 day

        res.status(200).json({
            success: true,
            message: 'Login successful!',
            token: `Bearer ${token}`,
            user: payload
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};