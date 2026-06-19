import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { Notification } from '../models/Notification';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password -otp -otpExpiry');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).select('-password -otp -otpExpiry');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.patch('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.patch('/profile/avatar', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { avatar } = req.body;
    if (!avatar) return res.status(400).json({ message: 'No avatar provided' });
    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.avatar = avatar;
    await user.save();
    res.json({ avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.patch('/profile/password', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ message: 'Both passwords required' });
    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(401).json({ message: 'Old password is incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.get('/pending-tutors', authenticate, authorize('admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const tutors = await User.find({ role: 'tutor', approved: false }).select('-password -otp -otpExpiry');
    res.json(tutors);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.patch('/:id/moderate', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { action } = req.body;
    if (!['approve', 'reject'].includes(action)) return res.status(400).json({ message: 'Invalid action' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.approved = action === 'approve';
    await user.save();
    res.json({ message: `Tutor ${action}d successfully` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.get('/notifications', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.find({ userId: req.user!.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.patch('/notifications/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.patch('/notifications/read-all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany({ userId: req.user!.id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.get('/tutors/search', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q) return res.json([]);
    const tutors = await User.find({
      role: 'tutor',
      approved: true,
      name: { $regex: q, $options: 'i' },
    }).select('-password -otp -otpExpiry');
    res.json(tutors);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
