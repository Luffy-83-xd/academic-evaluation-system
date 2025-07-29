const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
});

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  questions: [QuestionSchema],
  deadline: { type: Date, required: true },
  duration: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Quiz', QuizSchema);