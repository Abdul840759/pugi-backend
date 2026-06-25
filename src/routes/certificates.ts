import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { Certificate } from '../models/Certificate';
import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import User from '../models/User';

const router = Router();

const buildCertificatePdf = (certificate: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const width = doc.page.width;
    const height = doc.page.height;

    // Outer border
    doc.lineWidth(4).strokeColor('#1d4ed8')
      .rect(24, 24, width - 48, height - 48).stroke();
    doc.lineWidth(1).strokeColor('#93c5fd')
      .rect(40, 40, width - 80, height - 80).stroke();

    doc.fillColor('#1d4ed8')
      .font('Helvetica-Bold').fontSize(34)
      .text('Certificate of Completion', 0, 100, { align: 'center' });

    doc.fillColor('#374151')
      .font('Helvetica').fontSize(14)
      .text('This certifies that', 0, 170, { align: 'center' });

    doc.fillColor('#111827')
      .font('Helvetica-Bold').fontSize(28)
      .text(certificate.studentName, 0, 195, { align: 'center' });

    doc.fillColor('#374151')
      .font('Helvetica').fontSize(14)
      .text('has successfully completed the course', 0, 240, { align: 'center' });

    doc.fillColor('#1d4ed8')
      .font('Helvetica-Bold').fontSize(20)
      .text(certificate.courseTitle, 0, 265, { align: 'center' });

    const issuedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    doc.fillColor('#6b7280')
      .font('Helvetica').fontSize(12)
      .text(`Issued by ${certificate.instructorName || 'PUGI'} on ${issuedDate}`, 0, 320, { align: 'center' });

    doc.fillColor('#6b7280')
      .font('Helvetica').fontSize(10)
      .text(`Verification Code: ${certificate.verificationCode}`, 0, height - 70, { align: 'center' });

    doc.end();
  });
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
