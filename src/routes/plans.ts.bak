import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import User from '../models/User';

const router = Router();

// GET /api/plans/me — get current user's plan
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).select('plan planActivatedAt planExpiresAt skillLevel techLevel');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// PATCH /api/plans/upgrade — admin manually upgrades a user to pro
router.patch('/upgrade', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { userId, plan } = req.body;
    if (!['free', 'pro'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan' });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      {
        plan,
        planActivatedAt: plan === 'pro' ? new Date() : undefined,
      },
      { new: true }
    ).select('name email plan planActivatedAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ message: `User upgraded to ${plan}`, user });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// PATCH /api/plans/upgrade-self — user self-activates pro (after payment verified)
router.patch('/upgrade-self', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { plan: 'pro', planActivatedAt: new Date() },
      { new: true }
    ).select('name email plan planActivatedAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ message: 'Upgraded to PUGI Pro', user });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
