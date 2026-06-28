import crypto from 'crypto';
import passport from 'passport';
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';
import { sendOtpEmail, sendPasswordResetEmail } from '../utils/mailer';

const router = Router();

const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const OTP_TTL_MS = 10 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

const publicUser = (user: IUser) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  techLevel: user.techLevel,
  onboardingComplete: user.onboardingComplete,
});

const signAccess = (id: string, role: string) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: ACCESS_EXPIRES_IN,
  } as SignOptions);

const signRefresh = (id: string) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: REFRESH_EXPIRES_IN,
  } as SignOptions);

const hashValue = (value: string) => bcrypt.hash(value, 10);

const issueOtp = async (user: IUser) => {
  const otp = generateOtp();
  user.otp = await hashValue(otp);
  user.otpExpiry = new Date(Date.now() + OTP_TTL_MS);
  await user.save();
  await sendOtpEmail(user.email, otp);
};

const createSessionTokens = async (user: IUser) => {
  const accessToken = signAccess(user.id, user.role);
  const refreshToken = signRefresh(user.id);
  user.refreshTokenHash = await hashValue(refreshToken);
  await user.save();
  return { accessToken, refreshToken };
};

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = 'learner' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: await hashValue(password),
      role: role === 'tutor' ? 'tutor' : 'learner',
      approved: role === 'tutor' ? false : true,
      emailVerified: false,
      isVerified: false,
    });

    await issueOtp(user);

    return res.status(201).json({
      message: 'Registration successful. Check your email for your OTP.',
      email: user.email,
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    return res.status(500).json({ message: 'Server error', error: String(err) });
  }
});

router.post('/resend-otp', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.emailVerified || user.isVerified) return res.status(400).json({ message: 'Email already verified' });

    await issueOtp(user);
    return res.json({ message: 'A new verification code has been sent.', email: user.email });
  } catch (err) {
    console.error('RESEND OTP ERROR:', err);
    return res.status(500).json({ message: 'Server error', error: String(err) });
  }
});

router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.emailVerified || user.isVerified) return res.status(400).json({ message: 'Email already verified' });
    if (!user.otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    const valid = await bcrypt.compare(String(otp), user.otp);
    if (!valid) return res.status(400).json({ message: 'Invalid OTP' });

    user.emailVerified = true;
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const { accessToken, refreshToken } = await createSessionTokens(user);

    return res.json({
      message: 'Email verified successfully',
      user: publicUser(user),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.emailVerified && !user.isVerified) return res.status(403).json({ message: 'Please verify your email first' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const { accessToken, refreshToken } = await createSessionTokens(user);

    return res.json({
      user: publicUser(user),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { id: string };
    const user = await User.findById(payload.id);
    if (!user || !user.refreshTokenHash) return res.status(401).json({ message: 'Invalid refresh token' });

    const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!valid) return res.status(401).json({ message: 'Invalid refresh token' });

    return res.json({ accessToken: signAccess(user.id, user.role) });
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await User.findByIdAndUpdate(req.user!.id, { $unset: { refreshTokenHash: 1 } });
    return res.json({ message: 'Logged out successfully' });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(publicUser(user));
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/onboarding', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { techLevel } = req.body;
    if (!['beginner', 'intermediate', 'advanced'].includes(techLevel)) {
      return res.status(400).json({ message: 'Invalid tech level' });
    }
    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { techLevel, onboardingComplete: true },
      { new: true }
    );
    return res.json({ techLevel: user?.techLevel, onboardingComplete: user?.onboardingComplete });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (user) {
      const token = crypto.randomBytes(24).toString('hex');
      user.passwordResetToken = await hashValue(token);
      user.passwordResetExpiry = new Date(Date.now() + RESET_TTL_MS);
      await user.save();
      await sendPasswordResetEmail(user.email, token);
    }

    return res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: 'Email, token and new password are required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user || !user.passwordResetToken || !user.passwordResetExpiry || user.passwordResetExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const valid = await bcrypt.compare(String(token), user.passwordResetToken);
    if (!valid) return res.status(400).json({ message: 'Invalid reset token' });

    user.password = await hashValue(newPassword);
    user.emailVerified = true;
    user.isVerified = true;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    user.refreshTokenHash = undefined;
    await user.save();

    return res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// Google OAuth routes

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_failed` }),
  async (req: any, res) => {
    try {
      const user = req.user as any;
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

      // New user — issue tokens and send to onboarding
      if (user.isNewUser) {
        const accessToken = signAccess(user.id, user.role);
        const refreshToken = signRefresh(user.id);
        user.refreshTokenHash = await hashValue(refreshToken);
        await user.save();
        return res.redirect(`${frontendUrl}/auth/google/success?accessToken=${accessToken}&refreshToken=${refreshToken}&userId=${user.id}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&role=${user.role}&avatar=${encodeURIComponent(user.avatar || '')}&onboardingComplete=false`);
      }

      // Existing user — issue tokens and proceed
      const accessToken = signAccess(user.id, user.role);
      const refreshToken = signRefresh(user.id);
      user.refreshTokenHash = await hashValue(refreshToken);
      await user.save();

      res.redirect(`${frontendUrl}/auth/google/success?accessToken=${accessToken}&refreshToken=${refreshToken}&userId=${user.id}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&role=${user.role}&avatar=${encodeURIComponent(user.avatar || '')}&onboardingComplete=${user.onboardingComplete ? 'true' : 'false'}`);
    } catch (err) {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_failed`);
    }
  }
);

export default router;
