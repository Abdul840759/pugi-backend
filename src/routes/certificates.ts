import crypto from 'crypto';
import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { Certificate } from '../models/Certificate';
import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import User from '../models/User';

const router = Router();

const escapePdfText = (value: string) => value.replace(/[\\()]/g, '\\$&');

const buildCertificatePdf = (certificate: any) => {
  const lines = [
    'PUGI Certificate of Completion',
    `This certifies that ${certificate.studentName}`,
    `completed ${certificate.courseTitle}`,
    `Instructor: ${certificate.instructorName || 'PUGI'}`,
    `Issued: ${new Date(certificate.issuedAt).toLocaleDateString()}`,
    `Verification: ${certificate.verificationCode}`,
  ];
  const text = lines.map((line, index) => `BT /F1 ${index === 0 ? 24 : 14} Tf 72 ${720 - index * 42} Td (${escapePdfText(line)}) Tj ET`).join('\n');
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${Buffer.byteLength(text)} >> stream\n${text}\nendstream endobj`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${object}\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf);
};

router.post('/:courseId/issue', authenticate, authorize('learner'), async (req: AuthRequest, res: Response) => {
  try {
    const enrollment = await Enrollment.findOne({ userId: req.user!.id, courseId: req.params.courseId });
    if (!enrollment || enrollment.progress < 100) {
      return res.status(400).json({ message: 'Complete the course before requesting a certificate' });
    }

    const [course, user] = await Promise.all([
      Course.findById(req.params.courseId),
      User.findById(req.user!.id),
    ]);
    if (!course || !user) return res.status(404).json({ message: 'Course or user not found' });

    const certificate = await Certificate.findOneAndUpdate(
      { userId: req.user!.id, courseId: req.params.courseId },
      {
        $setOnInsert: {
          studentName: user.name,
          courseTitle: course.title,
          instructorName: course.instructor,
          verificationCode: crypto.randomBytes(8).toString('hex').toUpperCase(),
          issuedAt: new Date(),
        },
      },
      { new: true, upsert: true }
    );

    return res.status(201).json(certificate);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

router.get('/me', authenticate, authorize('learner'), async (req: AuthRequest, res: Response) => {
  try {
    const certificates = await Certificate.find({ userId: req.user!.id }).sort({ issuedAt: -1 });
    return res.json(certificates);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

router.get('/verify/:code', async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ verificationCode: req.params.code.toUpperCase() });
    if (!certificate) return res.status(404).json({ valid: false, message: 'Certificate not found' });
    return res.json({ valid: true, certificate });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

router.get('/:id/download', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const filter = req.user!.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, userId: req.user!.id };
    const certificate = await Certificate.findOne(filter);
    if (!certificate) return res.status(404).json({ message: 'Certificate not found' });

    const pdf = buildCertificatePdf(certificate);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="pugi-certificate-${certificate.verificationCode}.pdf"`);
    return res.send(pdf);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
