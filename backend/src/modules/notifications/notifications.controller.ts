import { Response } from 'express';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../middleware/auth';

const p = (req: AuthRequest) => req.params as { id: string };

export const listNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.userId, isRead: false },
    });

    return res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('List notifications error:', error);
    return res.status(500).json({ error: 'INTERNAL', message: 'Failed to list notifications' });
  }
};

export const markAllRead = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId, isRead: false },
      data: { isRead: true },
    });

    return res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    return res.status(500).json({ error: 'INTERNAL', message: 'Failed to mark all as read' });
  }
};

export const markOneRead = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { id: p(req).id, userId: req.userId },
      data: { isRead: true },
    });

    return res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark one read error:', error);
    return res.status(500).json({ error: 'INTERNAL', message: 'Failed to mark as read' });
  }
};

export const registerPushToken = async (req: AuthRequest, res: Response) => {
  try {
    const { token, platform } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'MISSING_TOKEN', message: 'Token is required' });
    }

    const existing = await prisma.pushToken.findUnique({ where: { token } });
    if (existing) {
      if (existing.userId !== req.userId) {
        await prisma.pushToken.update({ where: { id: existing.id }, data: { userId: req.userId! } });
      }
      return res.json({ message: 'Token already registered' });
    }

    await prisma.pushToken.create({
      data: {
        userId: req.userId!,
        token,
        platform: platform || 'web',
      },
    });

    return res.status(201).json({ message: 'Token registered' });
  } catch (error) {
    console.error('Register push token error:', error);
    return res.status(500).json({ error: 'INTERNAL', message: 'Failed to register token' });
  }
};

export const unregisterPushToken = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'MISSING_TOKEN', message: 'Token is required' });
    }

    await prisma.pushToken.deleteMany({ where: { token, userId: req.userId! } });
    return res.json({ message: 'Token unregistered' });
  } catch (error) {
    console.error('Unregister push token error:', error);
    return res.status(500).json({ error: 'INTERNAL', message: 'Failed to unregister token' });
  }
};
