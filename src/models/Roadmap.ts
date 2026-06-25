import mongoose from 'mongoose';

const roadmapCourseSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  order: { type: Number, required: true },
});

const roadmapSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    category: String,
    icon: String,
    courses: [roadmapCourseSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Roadmap = mongoose.model('Roadmap', roadmapSchema);
