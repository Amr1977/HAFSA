import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { ingestClientLog, clientLogLimiter, ingestClientLogPublic, clientPublicLimiter } from './logs.controller';

const router = Router();

router.post('/client', authenticate, clientLogLimiter, ingestClientLog);
// anonymous public ingest endpoint with stricter rate limiting
router.post('/client/public', clientPublicLimiter, ingestClientLogPublic);

export default router;
