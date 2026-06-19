import mongoose from 'mongoose';
const liveClassSchema = new mongoose.Schema({
  title: String,
  courseName: String,
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tutorName: String,
  date: String,
  time: String,
  duration: String,
  meetLink: String,
  students: { type: Number, default: 0 },
  status: { type: String, enum: ['scheduled', 'live', 'completed'], default: 'scheduled' },
}, { timestamps: true });
export const LiveClass = mongoose.model('LiveClass', liveClassSchema);
