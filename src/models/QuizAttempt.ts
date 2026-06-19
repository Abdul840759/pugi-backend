import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    moduleId: { type: String, required: true },
    quizId: { type: String, required: true },
    answers: [{ type: Number }],
    score: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    totalQuestions: { type: Number, required: true },
  },
  { timestamps: true }
);

export const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
