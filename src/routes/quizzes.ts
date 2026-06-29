import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { Course } from '../models/Course';
import { QuizAttempt } from '../models/QuizAttempt';
import { UserProgress } from '../models/Enrollment';

const router = Router();

const findModuleQuiz = async (courseId: string, moduleId: string, quizId: string) => {
  const course: any = await Course.findById(courseId);
  if (!course) return null;
  const courseModule = course.modules.id(moduleId) || course.modules.find((module: any) => module._id?.toString() === moduleId);
  if (!courseModule || !courseModule.quiz || courseModule.quiz._id?.toString() !== quizId) return null;
  return { course, courseModule, quiz: courseModule.quiz };
};

router.get('/:courseId/:moduleId/:quizId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await findModuleQuiz(req.params.courseId, req.params.moduleId, req.params.quizId);
    if (!result) return res.status(404).json({ message: 'Quiz not found' });

    const quiz = result.quiz;
    return res.json({
      id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts,
      questions: (quiz.questions || []).map((question: any) => ({
        id: question._id,
        prompt: question.prompt,
        options: question.options,
        points: question.points,
      })),
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

router.post('/:courseId/:moduleId/:quizId/submit', authenticate, authorize('learner'), async (req: AuthRequest, res: Response) => {
  try {
    const { answers } = req.body as { answers?: number[] };
    if (!Array.isArray(answers)) return res.status(400).json({ message: 'answers must be an array' });

    const result = await findModuleQuiz(req.params.courseId, req.params.moduleId, req.params.quizId);
    if (!result) return res.status(404).json({ message: 'Quiz not found' });

    const questions = result.quiz.questions || [];
    const totalPoints = questions.reduce((sum: number, question: any) => sum + (question.points || 1), 0);
    const earnedPoints = questions.reduce((sum: number, question: any, index: number) => (
      answers[index] === question.correctOptionIndex ? sum + (question.points || 1) : sum
    ), 0);
    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= (result.quiz.passingScore || 70);

    const attempt = await QuizAttempt.create({
      userId: req.user!.id,
      courseId: req.params.courseId,
      moduleId: req.params.moduleId,
      quizId: req.params.quizId,
      answers,
      score,
      passed,
      totalQuestions: questions.length,
    });

    if (passed) {
      const progress = await UserProgress.findOneAndUpdate(
        { userId: req.user!.id },
        { $inc: { xp: 100 } },
        { new: true, upsert: true }
      );
      return res.json({ attempt, score, passed, xp: progress.xp });
    }

    return res.json({ attempt, score, passed });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

router.get('/history/me', authenticate, authorize('learner'), async (req: AuthRequest, res: Response) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user!.id }).sort({ createdAt: -1 });
    return res.json(attempts);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});


// POST /api/quizzes/generate — AI quiz generator
router.post('/generate', authenticate, authorize('learner'), async (req: AuthRequest, res: Response) => {
  try {
    const { lessonContent, lessonTitle, count } = req.body;
    const questionCount = Math.max(5, Math.min(20, Number(count) || 5));
    if (!lessonContent) return res.status(400).json({ message: 'lessonContent is required' });

    const prompt = `You are a quiz generator for an online learning platform called PUGI.

Based on the following lesson content, generate exactly ${questionCount} multiple choice questions.

Lesson Title: ${lessonTitle || 'Programming Lesson'}

Lesson Content:
${lessonContent.slice(0, 5000)}

Return ONLY a valid JSON array with exactly ${questionCount} objects. Each object must have:
- "prompt": the question text
- "options": array of exactly 4 answer strings
- "correctOptionIndex": number 0-3 indicating correct answer
- "explanation": brief explanation of why that answer is correct

Return only the JSON array, no markdown, no extra text.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY || ''}`,
        'Connection': 'keep-alive',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data: any = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    let questions;
    try {
      const cleaned = text.replace(/```json|```/g, '').trim();
      questions = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({ message: 'Failed to parse AI response' });
    }

    return res.json({ questions, lessonTitle });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
