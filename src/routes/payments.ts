import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import PaymentRequest from '../models/PaymentRequest';
import Subscription from '../models/Subscription';
import User from '../models/User';

const router = Router();

// Bank details — configurable here, returned to frontend
const BANK_DETAILS = {
  accountName: process.env.PUGI_BANK_ACCOUNT_NAME || 'PUGI LMS',
  bankName: process.env.PUGI_BANK_NAME || 'Sample Bank',
  accountNumber: process.env.PUGI_BANK_ACCOUNT_NUMBER || '0000000000',
  amount: Number(process.env.PUGI_PRO_PRICE || 2500),
  currency: 'NGN',
  note: process.env.PUGI_BANK_NOTE || 'Payments are temporarily processed manually to this PUGI admin account while we finalize our automated payment integration. Your upgrade will be activated within 24 hours of verification.',
};

// GET /api/payments/bank-details
router.get('/bank-details', authenticate, async (_req: AuthRequest, res: Response) => {
  return res.json(BANK_DETAILS);
});

// POST /api/payments/request — learner submits receipt
router.post('/request', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { receiptUrl, reference, amount } = req.body;
    if (!receiptUrl) {
      return res.status(400).json({ message: 'Receipt image is required' });
    }

    const existingPending = await PaymentRequest.findOne({
      user: req.user!.id,
      status: 'pending',
    });
    if (existingPending) {
      return res.status(400).json({ message: 'You already have a pending payment request' });
    }

    const paymentRequest = await PaymentRequest.create({
      user: req.user!.id,
      receiptUrl,
      reference,
      amount: amount || BANK_DETAILS.amount,
      currency: 'NGN',
      status: 'pending',
    });

    await Subscription.create({
      user: req.user!.id,
      plan: 'pro',
      status: 'pending',
      paymentRequest: paymentRequest._id,
    });

    return res.status(201).json(paymentRequest);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET /api/payments/my-requests — learner views their own request history
router.get('/my-requests', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const requests = await PaymentRequest.find({ user: req.user!.id }).sort({ createdAt: -1 });
    return res.json(requests);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// ---- Admin routes ----

// GET /api/payments/admin/all — admin views all requests (optionally filter by status)
router.get('/admin/all', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const filter: any = {};
    if (status) filter.status = status;

    const requests = await PaymentRequest.find(filter)
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 });
    return res.json(requests);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// PATCH /api/payments/admin/:id/approve
router.patch('/admin/:id/approve', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const paymentRequest = await PaymentRequest.findById(req.params.id);
    if (!paymentRequest) return res.status(404).json({ message: 'Request not found' });
    if (paymentRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request already reviewed' });
    }

    paymentRequest.status = 'approved';
    paymentRequest.reviewedBy = req.user!.id as any;
    paymentRequest.reviewedAt = new Date();
    await paymentRequest.save();

    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30-day subscription cycle

    await Subscription.findOneAndUpdate(
      { paymentRequest: paymentRequest._id },
      {
        status: 'active',
        startDate,
        expiryDate,
        approvedBy: req.user!.id,
      },
      { new: true }
    );

    await User.findByIdAndUpdate(paymentRequest.user, {
      plan: 'pro',
      planActivatedAt: startDate,
      planExpiresAt: expiryDate,
    });

    return res.json({ message: 'Approved', paymentRequest });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// PATCH /api/payments/admin/:id/reject
router.patch('/admin/:id/reject', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const paymentRequest = await PaymentRequest.findById(req.params.id);
    if (!paymentRequest) return res.status(404).json({ message: 'Request not found' });
    if (paymentRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request already reviewed' });
    }

    paymentRequest.status = 'rejected';
    paymentRequest.rejectionReason = reason;
    paymentRequest.reviewedBy = req.user!.id as any;
    paymentRequest.reviewedAt = new Date();
    await paymentRequest.save();

    await Subscription.findOneAndUpdate(
      { paymentRequest: paymentRequest._id },
      { status: 'expired' }
    );

    return res.json({ message: 'Rejected', paymentRequest });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
