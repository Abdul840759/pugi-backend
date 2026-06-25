import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { Roadmap } from '../models/Roadmap';
import { Enrollment } from '../models/Enrollment';

const router = Router();

// GET /api/roadmaps — list all published roadmaps with course count
router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const roadmaps = await Roadmap.find({ published: true })
      .populate('courses.courseId', 'title thumbnail category level duration')
      .sort({ createdAt: -1 });
    return res.json(roadmaps);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET /api/roadmaps/:id — detail with lock/unlock state for the current learner
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id)
      .populate('courses.courseId', 'title description thumbnail category level duration');
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });

    const sortedCourses = [...roadmap.courses].sort((a: any, b: any) => a.order - b.order);
    const courseIds = sortedCourses.map((c: any) => c.courseId?._id).filter(Boolean);

    const enrollments = await Enrollment.find({
      userId: req.user!.id,
      courseId: { $in: courseIds },
    });
    const progressMap = new Map(
      enrollments.map((e: any) => [e.courseId.toString(), e.progress])
    );

    let previousCompleted = true; // first course is always unlocked
    let completedCount = 0;

    const courses = sortedCourses.map((entry: any) => {
      const course = entry.courseId;
      const courseIdStr = course?._id?.toString();
      const progress = progressMap.get(courseIdStr) || 0;
      const completed = progress >= 100;
      const locked = !previousCompleted;
      const unlocked = !locked;

      if (completed) completedCount += 1;
      previousCompleted = completed;

      return {
        order: entry.order,
        course,
        progress,
        completed,
        locked,
        unlocked,
      };
    });

    const overallProgress = courses.length > 0
      ? Math.round((completedCount / courses.length) * 100)
      : 0;

    return res.json({
      _id: roadmap._id,
      title: roadmap.title,
      description: roadmap.description,
      category: roadmap.category,
      icon: roadmap.icon,
      courses,
      overallProgress,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// POST /api/roadmaps — create (admin/tutor only)
router.post('/', authenticate, authorize('admin', 'tutor'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, icon, courses } = req.body;
    if (!title || !Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({ message: 'title and a non-empty courses array are required' });
    }
    const roadmap = await Roadmap.create({
      title,
      description,
      category,
      icon,
      courses: courses.map((c: any, idx: number) => ({
        courseId: c.courseId,
        order: c.order ?? idx,
      })),
      createdBy: req.user!.id,
    });
    return res.status(201).json(roadmap);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// PUT /api/roadmaps/:id — update (admin/tutor only)
router.put('/:id', authenticate, authorize('admin', 'tutor'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, icon, courses, published } = req.body;
    const update: any = { title, description, category, icon, published };
    if (Array.isArray(courses)) {
      update.courses = courses.map((c: any, idx: number) => ({
        courseId: c.courseId,
        order: c.order ?? idx,
      }));
    }
    const roadmap = await Roadmap.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });
    return res.json(roadmap);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// DELETE /api/roadmaps/:id — admin/tutor only
router.delete('/:id', authenticate, authorize('admin', 'tutor'), async (req: AuthRequest, res: Response) => {
  try {
    const roadmap = await Roadmap.findByIdAndDelete(req.params.id);
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });
    return res.json({ message: 'Roadmap deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
