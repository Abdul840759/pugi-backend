import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: String,
  duration: String,
  type: { type: String, enum: ['content', 'quiz', 'assignment'], default: 'content' },
  content: String,
  markdown: String,
  codeExample: String,
  videoUrl: String,
  imageUrl: String,
  downloads: [{
    title: String,
    url: String,
  }],
  assignment: {
    title: String,
    instructions: String,
    dueDays: Number,
    maxScore: Number,
  },
  order: { type: Number, default: 0 },
});

const questionSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
  explanation: String,
  points: { type: Number, default: 1 },
});

const quizSchema = new mongoose.Schema({
  title: String,
  description: String,
  questions: [questionSchema],
  passingScore: { type: Number, default: 70 },
  maxAttempts: { type: Number, default: 3 },
});

const moduleSchema = new mongoose.Schema({
  title: String,
  description: String,
  order: { type: Number, default: 0 },
  lessons: [lessonSchema],
  quiz: quizSchema,
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    thumbnail: String,
    instructor: String,
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    category: String,
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    duration: String,
    rating: { type: Number, default: 0 },
    enrolledCount: { type: Number, default: 0 },
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'rejected'],
      default: 'draft',
    },
    nextCourseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
    isPremium: { type: Boolean, default: false },
    modules: [moduleSchema],
  },
  { timestamps: true }
);

export const Course = mongoose.model('Course', courseSchema);
