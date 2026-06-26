import crypto from 'crypto';
import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Payment from '../models/Payment';

const router = Router();

const PRO_PRICE_NAIRA = 2500;
const PRO_PRICE_KOBO = PRO_PRICE_NAIRA * 100;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

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

// PATCH /api/plans/upgrade-self — user self-activates pro (admin/manual fallback, no payment check)
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

// POST /api/plans/payment/initialize — creates a pending payment record + reference
router.post('/payment/initialize', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).select('email plan');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.plan === 'pro') {
      return res.status(400).json({ message: 'You are already on PUGI Pro' });
    }

    const reference = `PUGI_${crypto.randomBytes(12).toString('hex')}`;

    await Payment.create({
      user: user._id,
      reference,
      amount: PRO_PRICE_KOBO,
      currency: 'NGN',
      plan: 'pro',
      status: 'pending',
    });

    return res.json({
      reference,
      amount: PRO_PRICE_KOBO,
      email: user.email,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// POST /api/plans/payment/verify — re-verifies with Paystack directly, then upgrades the user
router.post('/payment/verify', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { reference } = req.body;
    if (!reference) return res.status(400).json({ message: 'Reference is required' });

    const payment = await Payment.findOne({ reference, user: req.user!.id });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (payment.status === 'success') {
      const user = await User.findById(req.user!.id).select('name email plan planActivatedAt');
      return res.json({ message: 'Already verified', user });
    }

    if (!PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ message: 'Payment provider not configured' });
    }

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });
    const verifyData: any = await verifyRes.json();

    if (!verifyData?.status || verifyData?.data?.status !== 'success') {
      payment.status = 'failed';
      payment.paystackData = verifyData?.data;
      await payment.save();
      return res.status(400).json({ message: 'Payment was not successful' });
    }

    const paidAmount = verifyData.data.amount;
    const paidCurrency = verifyData.data.currency;

    if (paidAmount !== payment.amount || paidCurrency !== payment.currency) {
      payment.status = 'failed';
      payment.paystackData = verifyData.data;
      await payment.save();
      return res.status(400).json({ message: 'Payment amount mismatch' });
    }

    payment.status = 'success';
    payment.paystackData = verifyData.data;
    await payment.save();

    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { plan: 'pro', planActivatedAt: new Date() },
      { new: true }
    ).select('name email plan planActivatedAt');

    return res.json({ message: 'Upgraded to PUGI Pro', user });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
