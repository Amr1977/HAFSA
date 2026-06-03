import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { listNotifications, markAllRead, markOneRead, registerPushToken, unregisterPushToken } from './notifications.controller';

const router = Router();

router.use(authenticate);

router.get('/', listNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markOneRead);
router.post('/push-token', registerPushToken);
router.delete('/push-token', unregisterPushToken);

export default router;
