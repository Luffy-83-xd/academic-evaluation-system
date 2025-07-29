// Import required packages
require('dotenv').config(); // Loads environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message');
const User = require('./models/User'); 
const Notification = require('./models/Notification')

// Initialize Express App
const app = express();

// Middlewares
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies
// Middleware to attach io and onlineUsers to each request
app.use((req, res, next) => {
    req.io = io;
    req.onlineUsers = onlineUsers;
    next();
});

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Basic Route ---
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Academic Evaluation and Monitoring System API!' });
});

// --- API Routes ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/uploads', express.static('uploads')); // Make uploads folder static
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// --- Socket.IO Setup ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

let onlineUsers = {}; // Maps userId to socketId

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // When a user logs in, they should emit this event
  socket.on('addUser', (userId) => {
    onlineUsers[userId] = socket.id;
    console.log('Online users:', onlineUsers);
  });

  // Listen for a chat message
  socket.on('sendMessage', async ({ senderId, receiverId, content }) => {
    // 1. Save message to database
    const newMessage = new Message({ sender: senderId, receiver: receiverId, content });
    await newMessage.save();

    // 2. Send message to the receiver in real-time
    const receiverSocketId = onlineUsers[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', newMessage);
    }
    
    // 3. Send message back to the sender as well (for UI confirmation)
    socket.emit('receiveMessage', newMessage);
  });

  // Listen for a broadcast message from a proctor
  socket.on('broadcastMessage', async ({ senderName, content }) => {
      try {
          const students = await User.find({ role: 'student' });

          // Create a notification for each student
          for (const student of students) {
              const newNotification = new Notification({
                  user: student._id,
                  message: `Announcement from ${senderName}: ${content}`,
                  link: '/student/resources' // Or any relevant link
              });
              await newNotification.save();

              // If the student is online, send the notification in real-time
              const receiverSocketId = onlineUsers[student._id];
              if (receiverSocketId) {
                  io.to(receiverSocketId).emit('newNotification', newNotification);
              }
          }
      } catch (error) {
          console.error("Broadcast error:", error);
      }
  });
  
  socket.on('disconnect', () => {
    // Remove user from onlineUsers on disconnect
    for (const userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
        break;
      }
    }
    console.log(`User disconnected: ${socket.id}`);
    console.log('Online users:', onlineUsers);
  });

  
});


// --- Start The Server ---
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});