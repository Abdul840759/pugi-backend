import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { LiveClass } from '../models/LiveClass';

const router = Router();

// GET /api/live-classes — list all scheduled/live classes
router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const classes = await LiveClass.find({ status: { $in: ['scheduled', 'live'] } })
      .sort({ date: 1, time: 1 });
    return res.json(classes);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// POST /api/live-classes — tutor creates a live class
router.post('/', authenticate, authorize('tutor', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, courseName, courseId, date, time, duration, meetLink } = req.body;
    if (!title || !date || !time || !meetLink) {
      return res.status(400).json({ message: 'title, date, time, and meetLink are required' });
    }
    const liveClass = await LiveClass.create({
      title,
      courseName,
      courseId,
      tutorId: req.user!.id,
      tutorName: req.user!.name,
      date,
      time,
      duration,
      meetLink,
      status: 'scheduled',
    });
    return res.status(201).json(liveClass);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// PATCH /api/live-classes/:id/status — tutor updates status
router.patch('/:id/status', authenticate, authorize('tutor', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const liveClass = await LiveClass.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!liveClass) return res.status(404).json({ message: 'Live class not found' });
    return res.json(liveClass);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// DELETE /api/live-classes/:id
router.delete('/:id', authenticate, authorize('tutor', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    await LiveClass.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
