const Message = require('../models/Message');

// @desc   Get chat history with a specific user
// @route  GET /api/chat/history/:userId
// @access Private
exports.getChatHistory = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;
        const otherUserId = req.params.userId;

        const messages = await Message.find({
            $or: [
                { sender: loggedInUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: loggedInUserId },
            ]
        }).sort({ createdAt: 'asc' });

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};