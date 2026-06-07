import { Response } from 'express';
import rateLimit from 'express-rate-limit';
import logger from '../../services/logger';
import { AuthRequest } from '../../middleware/auth';

export const clientLogLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    error: 'RATE_LIMIT',
    messageAr: 'طلبات كثيرة جداً. يرجى المحاولة بعد دقيقة',
    messageEn: 'Too many requests. Please try again later.',
  },
});

export const ingestClientLog = async (req: AuthRequest, res: Response) => {
  try {
    const { level, message, stack, url, userAgent, timestamp } = req.body;

    const logEntry = {
      client: true,
      userId: req.userId || 'anonymous',
      url,
      userAgent: userAgent || req.headers['user-agent'],
      timestamp: timestamp || new Date().toISOString(),
      stack,
    };

    switch (level) {
      case 'error':
        logger.error(`[CLIENT] ${message}`, logEntry);
        break;
      case 'warn':
        logger.warn(`[CLIENT] ${message}`, logEntry);
        break;
      case 'info':
        logger.info(`[CLIENT] ${message}`, logEntry);
        break;
      default:
        logger.debug(`[CLIENT] ${message}`, logEntry);
    }

    res.json({ ok: true });
  } catch (error) {
    logger.error('Failed to ingest client log', { error });
    res.status(500).json({ error: 'INTERNAL', message: 'Failed to process log' });
  }
};
