import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticate, AuthRequest } from '../middleware/auth';
import User from '../models/User';

const router = Router();

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET as string;
const ADMIN_PIN_HASH = process.env.ADMIN_PIN_HASH || '';
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

const isEligibleEmail = (email: string) => ADMIN_EMAILS.includes(email.toLowerCase());

// GET /api/admin/check — is the currently authenticated user allowed to attempt admin access?
router.get('/check', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).select('email role');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!isEligibleEmail(user.email)) {
      return res.json({ eligible: false });
    }

    return res.json({ eligible: true });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// POST /api/admin/verify-pin — exchanges the admin PIN for a short-lived admin session token
router.post('/verify-pin', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { pin } = req.body;
    if (!pin) return res.status(400).json({ message: 'PIN is required' });

    const user = await User.findById(req.user!.id).select('email role adminPinFailCount adminPinLockedUntil');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!isEligibleEmail(user.email)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (user.adminPinLockedUntil && user.adminPinLockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.adminPinLockedUntil.getTime() - Date.now()) / 60000);
      return res.status(429).json({ message: `Too many attempts. Try again in ${minutesLeft} minute(s).` });
    }

    if (!ADMIN_PIN_HASH) {
      return res.status(500).json({ message: 'Admin PIN is not configured' });
    }

    const valid = await bcrypt.compare(String(pin), ADMIN_PIN_HASH);
    if (!valid) {
      user.adminPinFailCount = (user.adminPinFailCount || 0) + 1;
      if (user.adminPinFailCount >= LOCKOUT_THRESHOLD) {
        user.adminPinLockedUntil = new Date(Date.now() + LOCKOUT_MS);
        user.adminPinFailCount = 0;
      }
      await user.save();
      return res.status(401).json({ message: 'Incorrect PIN' });
    }

    user.adminPinFailCount = 0;
    user.adminPinLockedUntil = undefined;
    if (user.role !== 'admin') user.role = 'admin';
    await user.save();

    const adminToken = jwt.sign({ id: user.id, scope: 'admin' }, ADMIN_SESSION_SECRET, { expiresIn: '4h' });
    return res.json({ adminToken });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
