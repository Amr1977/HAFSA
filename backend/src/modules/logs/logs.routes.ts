import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { ingestClientLog, clientLogLimiter } from './logs.controller';

const router = Router();

router.post('/client', authenticate, clientLogLimiter, ingestClientLog);

export default router;
