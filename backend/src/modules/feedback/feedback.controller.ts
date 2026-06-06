import { Response } from 'express';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../middleware/auth';

const p = (req: AuthRequest) => req.params as { id: string };

export const createFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { type, title, content, rating } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'VALIDATION', message: 'Title and content are required' });
    }
    const feedback = await prisma.feedback.create({
      data: {
        userId: req.userId!,
        type: type || 'FEEDBACK',
        title,
        content,
        rating: rating || null,
      },
    });
    return res.status(201).json(feedback);
  } catch (error) {
    console.error('Create feedback error:', error);
    return res.status(500).json({ error: 'INTERNAL', message: 'Failed to submit feedback' });
  }
};

export const getTestimonials = async (_req: AuthRequest, res: Response) => {
  try {
    const testimonials = await prisma.feedback.findMany({
      where: { type: 'TESTIMONIAL', status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true } } },
    });
    return res.json(testimonials);
  } catch (error) {
    console.error('Get testimonials error:', error);
    return res.status(500).json({ error: 'INTERNAL', message: 'Failed to get testimonials' });
  }
};

export const listFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { type, status, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, parseInt(limit as string));
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const [feedback, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, email: true, phone: true, roles: true } } },
      }),
      prisma.feedback.count({ where }),
    ]);
    return res.json({ feedback, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) {
    console.error('List feedback error:', error);
    return res.status(500).json({ error: 'INTERNAL', message: 'Failed to list feedback' });
  }
};

export const approveFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const fb = await prisma.feedback.update({
      where: { id: p(req).id },
      data: { status: 'APPROVED' },
    });
    return res.json(fb);
  } catch (error) {
    console.error('Approve feedback error:', error);
    return res.status(500).json({ error: 'INTERNAL', message: 'Failed to approve' });
  }
};

export const rejectFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const fb = await prisma.feedback.update({
      where: { id: p(req).id },
      data: { status: 'REJECTED' },
    });
    return res.json(fb);
  } catch (error) {
    console.error('Reject feedback error:', error);
    return res.status(500).json({ error: 'INTERNAL', message: 'Failed to reject' });
  }
};

export const deleteFeedback = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.feedback.delete({ where: { id: p(req).id } });
    return res.json({ message: 'Feedback deleted' });
  } catch (error) {
    console.error('Delete feedback error:', error);
    return res.status(500).json({ error: 'INTERNAL', message: 'Failed to delete' });
  }
};
