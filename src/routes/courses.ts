import { Router, Response } from 'express';
import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/courses — all published courses (with optional search/filter)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { search, category, level, minLevel } = req.query;
    const query: any = { status: 'published' };
    const levelOrder = ['beginner', 'intermediate', 'advanced'];

    if (search) query.title = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (level) query.level = level;
    if (minLevel && levelOrder.includes(minLevel as string)) {
      const idx = levelOrder.indexOf(minLevel as string);
      query.level = { $in: levelOrder.slice(idx) };
    }

    const courses = await Course.find(query).sort({ createdAt: -1 });
    return res.json(courses);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET /api/courses/enrolled — courses learner is enrolled in
router.get('/enrolled', authenticate, authorize('learner'), async (req: AuthRequest, res: Response) => {
  try {
    const courses = await Course.find({ enrolledStudents: req.user!.id });
    return res.json(courses);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET /api/courses/tutor — courses created by logged in tutor
router.get('/tutor', authenticate, authorize('tutor'), async (req: AuthRequest, res: Response) => {
  try {
    const courses = await Course.find({ instructorId: req.user!.id }).sort({ createdAt: -1 });
    return res.json(courses);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET /api/courses/pending — pending courses (admin)
router.get('/pending', authenticate, authorize('admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const courses = await Course.find({ status: 'pending' }).sort({ createdAt: -1 });
    return res.json(courses);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET /api/courses/:id — single course
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    return res.json(course);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// POST /api/courses — create course (tutor)
router.post('/', authenticate, authorize('tutor'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, level, thumbnail, duration, modules, status } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const course = await Course.create({
      title,
      description,
      category,
      level,
      thumbnail,
      duration,
      modules: modules || [],
      instructor: req.user!.name,
      instructorId: req.user!.id,
      status: status === 'draft' ? 'draft' : 'pending',
    });

    return res.status(201).json(course);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// PATCH /api/courses/:id — update course (tutor)
router.patch('/:id', authenticate, authorize('tutor'), async (req: AuthRequest, res: Response) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, instructorId: req.user!.id });
    if (!course) return res.status(404).json({ message: 'Course not found or unauthorized' });

    const allowed = ['title', 'description', 'category', 'level', 'thumbnail', 'duration', 'modules'];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) (course as any)[key] = req.body[key];
    });

    await course.save();
    return res.json(course);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// PATCH /api/courses/:id/status — set course status (tutor draft/publish)
router.patch('/:id/status', authenticate, authorize('tutor'), async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!['draft', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Status must be draft or pending' });
    }

    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, instructorId: req.user!.id },
      { status },
      { new: true }
    );
    if (!course) return res.status(404).json({ message: 'Course not found or unauthorized' });

    return res.json(course);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// DELETE /api/courses/:id — delete course (tutor or admin)
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const filter =
      req.user!.role === 'admin'
        ? { _id: req.params.id }
        : { _id: req.params.id, instructorId: req.user!.id };

    const course = await Course.findOneAndDelete(filter);
    if (!course) return res.status(404).json({ message: 'Course not found or unauthorized' });

    return res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// POST /api/courses/:id/enroll — enroll learner
router.post('/:id/enroll', authenticate, authorize('learner'), async (req: AuthRequest, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const alreadyEnrolled = (course as any).enrolledStudents?.some(
      (studentId: any) => studentId.toString() === req.user!.id
    );
    if (alreadyEnrolled) return res.status(400).json({ message: 'Already enrolled' });

    await Promise.all([
      Course.findByIdAndUpdate(req.params.id, {
        $addToSet: { enrolledStudents: req.user!.id },
        $inc: { enrolledCount: 1 },
      }),
      Enrollment.updateOne(
        { userId: req.user!.id, courseId: req.params.id },
        { $setOnInsert: { completedLessons: [], progress: 0, lastAccessed: new Date() } },
        { upsert: true }
      ),
    ]);

    return res.json({ message: 'Enrolled successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// PATCH /api/courses/:id/moderate — approve or reject (admin)
router.patch('/:id/moderate', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { action } = req.body;
    if (!['approve', 'reject'].includes(action))
      return res.status(400).json({ message: 'Invalid action' });

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { status: action === 'approve' ? 'published' : 'rejected' },
      { new: true }
    );
    if (!course) return res.status(404).json({ message: 'Course not found' });

    return res.json({ message: `Course ${action}d`, course });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
