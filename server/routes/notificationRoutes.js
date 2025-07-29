const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getNotifications, markNotificationsAsRead } = require('../controllers/notificationController');

router.route('/').get(protect, getNotifications);
router.route('/mark-read').put(protect, markNotificationsAsRead);

module.exports = router;