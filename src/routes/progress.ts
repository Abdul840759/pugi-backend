import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { Enrollment, UserProgress } from '../models/Enrollment';
import { Course } from '../models/Course';
import User from '../models/User';
import { LiveClass } from '../models/LiveClass';

const router = Router();

const BADGES = [
  { id: 'first_steps',  name: 'First Steps',  description: 'Complete your first lesson',  icon: '🎯' },
  { id: 'week_warrior', name: 'Week Warrior',  description: '7-day learning streak',        icon: '🔥' },
  { id: 'quiz_master',  name: 'Quiz Master',   description: 'Score 80%+ on a quiz',         icon: '🧠' },
  { id: 'code_ninja',   name: 'Code Ninja',    description: 'Complete 5 courses',            icon: '🥷' },
];

const awardBadge = (progress: any, badgeId: string) => {
  const already = progress.badges.some((b: any) => b.id === badgeId);
  if (already) return false;
  const badge = BADGES.find((b) => b.id === badgeId);
  if (!badge) return false;
  progress.badges.push({ ...badge, earnedAt: new Date() });
  return true;
};

const updateStreak = (progress: any) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!progress.lastStreakDate) {
    progress.streak = 1;
    progress.lastStreakDate = today;
    return;
  }

  const last = new Date(progress.lastStreakDate);
  const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
  const diffDays = Math.floor((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return; // already updated today
  if (diffDays === 1) {
    progress.streak += 1;
  } else {
    progress.streak = 1; // reset streak
  }
  progress.lastStreakDate = today;
};

// POST /api/progress/complete-lesson
router.post('/complete-lesson', authenticate, authorize('learner'), async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, lessonId } = req.body;
    if (!courseId || !lessonId)
      return res.status(400).json({ message: 'courseId and lessonId are required' });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Count total lessons
    const totalLessons = course.modules.reduce(
      (acc: number, mod: any) => acc + (mod.lessons?.length || 0), 0
    );

    // Update enrollment
    let enrollment = await Enrollment.findOne({ userId: req.user!.id, courseId });
    if (!enrollment) {
      enrollment = await Enrollment.create({
        userId: req.user!.id,
        courseId,
        completedLessons: [],
        progress: 0,
      });
    }

    const alreadyDone = enrollment.completedLessons.map(String).includes(String(lessonId));
    if (!alreadyDone) {
      enrollment.completedLessons.push(lessonId);
    }
    // Always deduplicate before calculating progress
    enrollment.completedLessons = [...new Set(enrollment.completedLessons.map(String))];
    enrollment.progress = totalLessons > 0
      ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      : 0;
    enrollment.lastAccessed = new Date();
    await enrollment.save();

    // Update user progress
    let userProgress = await UserProgress.findOne({ userId: req.user!.id });
    if (!userProgress) {
      userProgress = await UserProgress.create({ userId: req.user!.id, xp: 0, streak: 0, badges: [] });
    }

    const newBadges: string[] = [];

    if (!alreadyDone) {
      userProgress.xp += 50;
      updateStreak(userProgress);

      // Badge checks
      const totalCompleted = await Enrollment.aggregate([
        { $match: { userId: req.user!.id } },
        { $project: { count: { $size: '$completedLessons' } } },
        { $group: { _id: null, total: { $sum: '$count' } } },
      ]);
      const lessonCount = totalCompleted[0]?.total || 0;

      if (lessonCount >= 1 && awardBadge(userProgress, 'first_steps')) newBadges.push('First Steps');
      if (userProgress.streak >= 7 && awardBadge(userProgress, 'week_warrior')) newBadges.push('Week Warrior');

      const completedCourses = await Enrollment.countDocuments({
        userId: req.user!.id,
        progress: 100,
      });
      if (completedCourses >= 5 && awardBadge(userProgress, 'code_ninja')) newBadges.push('Code Ninja');
    }

    await userProgress.save();

    return res.json({
      xp: userProgress.xp,
      streak: userProgress.streak,
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons,
      newBadges,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// POST /api/progress/uncomplete-lesson
router.post('/uncomplete-lesson', authenticate, authorize('learner'), async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, lessonId } = req.body;
    if (!courseId || !lessonId)
      return res.status(400).json({ message: 'courseId and lessonId are required' });
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const totalLessons = course.modules.reduce(
      (acc: number, mod: any) => acc + (mod.lessons?.length || 0), 0
    );
    const enrollment = await Enrollment.findOne({ userId: req.user!.id, courseId });
    if (!enrollment) {
      return res.json({ progress: 0, completedLessons: [] });
    }
    enrollment.completedLessons = enrollment.completedLessons.filter(
      (lid: string) => lid !== lessonId
    );
    enrollment.progress = totalLessons > 0
      ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      : 0;
    await enrollment.save();
    return res.json({
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET /api/progress/course/:courseId
router.get('/course/:courseId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const enrollment = await Enrollment.findOne({
      userId: req.user!.id,
      courseId: req.params.courseId,
    });
    if (!enrollment) return res.json({ completedLessons: [], progress: 0 });
    return res.json({
      completedLessons: enrollment.completedLessons,
      progress: enrollment.progress,
      lastAccessed: enrollment.lastAccessed,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET /api/progress/learner
router.get('/learner', authenticate, authorize('learner'), async (req: AuthRequest, res: Response) => {
  try {
    const userProgress = await UserProgress.findOne({ userId: req.user!.id });
    const enrollments  = await Enrollment.find({ userId: req.user!.id }).populate('courseId');

    return res.json({
      xp:          userProgress?.xp      || 0,
      streak:      userProgress?.streak  || 0,
      badges:      userProgress?.badges  || [],
      enrollments: enrollments.map((e) => ({
        course:           e.courseId,
        progress:         e.progress,
        completedLessons: e.completedLessons,
        lastAccessed:     e.lastAccessed,
      })),
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// POST /api/progress/quiz
router.post('/quiz', authenticate, authorize('learner'), async (req: AuthRequest, res: Response) => {
  try {
    const { score } = req.body;

    let userProgress = await UserProgress.findOne({ userId: req.user!.id });
    if (!userProgress) {
      userProgress = await UserProgress.create({ userId: req.user!.id, xp: 0, streak: 0, badges: [] });
    }

    const passed = score >= 80;
    const newBadges: string[] = [];

    if (passed) {
      userProgress.xp += 100;
      if (awardBadge(userProgress, 'quiz_master')) newBadges.push('Quiz Master');
      await userProgress.save();
    }

    return res.json({ passed, xp: userProgress.xp, newBadges });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET /api/progress/tutor/analytics
router.get('/tutor/analytics', authenticate, authorize('tutor'), async (req: AuthRequest, res: Response) => {
  try {
    const courses = await Course.find({ instructorId: req.user!.id });
    const courseIds = courses.map((c) => c._id);

    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } });

    const analytics = courses.map((course) => {
      const courseEnrollments = enrollments.filter(
        (e) => e.courseId.toString() === course._id.toString()
      );
      const avgProgress =
        courseEnrollments.length > 0
          ? Math.round(courseEnrollments.reduce((a, e) => a + e.progress, 0) / courseEnrollments.length)
          : 0;

      return {
        courseId:    course._id,
        title:       course.title,
        enrolled:    courseEnrollments.length,
        avgProgress,
      };
    });

    return res.json({
      totalStudents: enrollments.length,
      activeCourses: courses.length,
      totalRevenue: 0,
      avgRating: courses.length > 0
        ? Number((courses.reduce((sum, course: any) => sum + (course.rating || 0), 0) / courses.length).toFixed(1))
        : 0,
      enrollmentTrend: [
        { month: 'Jan', students: 0 },
        { month: 'Feb', students: 0 },
        { month: 'Mar', students: 0 },
        { month: 'Apr', students: enrollments.length },
      ],
      coursePerformance: analytics.map((course) => ({
        course: course.title,
        completion: course.avgProgress,
      })),
      courses: analytics,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET /api/progress/tutor/students
router.get('/tutor/students', authenticate, authorize('tutor'), async (req: AuthRequest, res: Response) => {
  try {
    const courses = await Course.find({ instructorId: req.user!.id });
    const courseIds = courses.map((course) => course._id);
    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
      .populate('userId', 'name email')
      .populate('courseId', 'title');

    const students = enrollments.map((enrollment: any) => {
      const lastActive = enrollment.lastAccessed
        ? new Date(enrollment.lastAccessed).toLocaleDateString()
        : 'Never';
      return {
        id: enrollment._id,
        name: enrollment.userId?.name || 'Unknown student',
        email: enrollment.userId?.email || 'unknown@example.com',
        course: enrollment.courseId?.title || 'Unknown course',
        progress: enrollment.progress || 0,
        quizScore: 0,
        lastActive,
        status: enrollment.progress >= 80 ? 'active' : enrollment.progress <= 10 ? 'at-risk' : 'inactive',
      };
    });

    return res.json(students);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET /api/progress/tutor/live-classes
router.get('/tutor/live-classes', authenticate, authorize('tutor'), async (req: AuthRequest, res: Response) => {
  try {
    const classes = await LiveClass.find({ tutorId: req.user!.id }).sort({ date: 1, time: 1 });
    return res.json(classes.map((liveClass: any) => ({
      id: liveClass._id,
      title: liveClass.title,
      courseName: liveClass.courseName,
      date: liveClass.date,
      time: liveClass.time,
      duration: liveClass.duration,
      students: liveClass.students,
      status: liveClass.status,
    })));
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET /api/progress/admin/stats
router.get('/admin/stats', authenticate, authorize('admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, totalCourses, totalTutors, totalLearners, enrollments] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments({ status: 'published' }),
      User.countDocuments({ role: 'tutor' }),
      User.countDocuments({ role: 'learner' }),
      Enrollment.countDocuments(),
    ]);

    const pendingApprovals = await User.countDocuments({ role: 'tutor', approved: false });

    return res.json({
      totalUsers,
      totalCourses,
      totalTutors,
      totalLearners,
      totalEnrollments: enrollments,
      pendingApprovals,
      monthlyGrowth: [
        { month: 'Jan', users: 0 },
        { month: 'Feb', users: 0 },
        { month: 'Mar', users: 0 },
        { month: 'Apr', users: totalUsers },
      ],
      roleDistribution: [
        { name: 'Learners', value: totalLearners },
        { name: 'Tutors', value: totalTutors },
        { name: 'Admins', value: Math.max(totalUsers - totalLearners - totalTutors, 0) },
      ],
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});


// POST /api/progress/tutor/live-classes
router.post('/tutor/live-classes', authenticate, authorize('tutor'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, courseName, date, time, duration, meetLink } = req.body;
    if (!title || !date || !time || !meetLink) {
      return res.status(400).json({ message: 'title, date, time and meetLink are required' });
    }
    const tutor = await User.findById(req.user!.id);
    const liveClass = await LiveClass.create({
      title, courseName, date, time,
      duration: duration || '1 hour',
      meetLink,
      tutorId: req.user!.id,
      tutorName: tutor?.name || 'Unknown',
      status: 'scheduled',
    });
    return res.status(201).json(liveClass);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// DELETE /api/progress/tutor/live-classes/:id
router.delete('/tutor/live-classes/:id', authenticate, authorize('tutor'), async (req: AuthRequest, res: Response) => {
  try {
    await LiveClass.findOneAndDelete({ _id: req.params.id, tutorId: req.user!.id });
    return res.json({ message: 'Class deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET /api/progress/learner/live-classes/search
router.get('/learner/live-classes/search', authenticate, authorize('learner'), async (req: AuthRequest, res: Response) => {
  try {
    const q = (req.query.q as string) || '';
    const query: any = q
      ? {
          status: { $in: ['scheduled', 'live'] },
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { courseName: { $regex: q, $options: 'i' } },
            { tutorName: { $regex: q, $options: 'i' } },
          ],
        }
      : { status: { $in: ['scheduled', 'live'] } };
    const classes = await LiveClass.find(query).sort({ date: 1, time: 1 }).limit(20);
    return res.json(classes.map((c: any) => ({
      id: c._id,
      title: c.title,
      courseName: c.courseName,
      tutorName: c.tutorName,
      date: c.date,
      time: c.time,
      duration: c.duration,
      meetLink: c.meetLink,
      students: c.students,
      status: c.status,
    })));
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});


// GET /api/progress/leaderboard
router.get('/leaderboard', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const week = new Date();
    week.setDate(week.getDate() - 7);

    const learners = await User.find({ role: 'learner' })
      .select('name email avatar xp streak level')
      .sort({ xp: -1 })
      .limit(20);

    const leaderboard = learners.map((user, index) => ({
      rank:   index + 1,
      id:     user._id,
      name:   user.name,
      email:  user.email,
      avatar: user.avatar,
      xp:     user.xp || 0,
      streak: user.streak || 0,
      level:  Math.floor((user.xp || 0) / 500) + 1,
    }));

    return res.json(leaderboard);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;