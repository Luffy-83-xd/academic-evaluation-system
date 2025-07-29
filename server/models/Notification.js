const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { // The user who will receive the notification
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  link: { // Optional URL to navigate to on click
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);