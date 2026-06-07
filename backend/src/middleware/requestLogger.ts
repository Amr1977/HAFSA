import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import logger from '../services/logger';

export const requestLogger = (req: AuthRequest, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const userId = req.userId || 'anonymous';

    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || '',
    };

    if (res.statusCode >= 500) {
      logger.error('HTTP Request', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};
