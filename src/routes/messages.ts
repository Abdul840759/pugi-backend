import { Router, Response } from 'express';
import { Conversation } from '../models/Conversation';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import User from '../models/User';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await Conversation.find({ participants: req.user!.id }).sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.post('/start', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { tutorId } = req.body;
    if (!tutorId) return res.status(400).json({ message: 'tutorId is required' });

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user!.id, tutorId] },
    });

    if (!conversation) {
      const tutor = await User.findById(tutorId);
      if (!tutor) return res.status(404).json({ message: 'Tutor not found' });

      conversation = await Conversation.create({
        participants: [req.user!.id, tutorId],
        participantName: tutor.name,
        participantAvatar: tutor.avatar,
        messages: [],
      });
    }

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.post('/:id/messages', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    conversation.messages.push({
      senderId: req.user!.id,
      senderName: req.user!.name || '',
      content: req.body.content,
      read: false,
    } as any);

    await conversation.save();
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
