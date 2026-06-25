import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import User from '../models/User';

export async function requirePro(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.plan !== 'pro') {
      return res.status(403).json({
        message: 'This feature requires PUGI Pro.',
        code: 'PRO_REQUIRED',
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
}
