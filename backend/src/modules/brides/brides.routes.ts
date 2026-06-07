import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireGuardian, requireGroom } from '../../middleware/roleGuard';
import {
  createBride, getMyBrides, getBride, updateBride, deleteBride,
  exposeBride, removeExposure, getBrideExposures,
  getVisibleBrides,
} from './brides.controller';

const router = Router();

router.get('/visible', authenticate, requireGroom, getVisibleBrides);

router.post('/', authenticate, requireGuardian, createBride);
router.get('/', authenticate, requireGuardian, getMyBrides);
router.get('/:id', authenticate, requireGuardian, getBride);
router.put('/:id', authenticate, requireGuardian, updateBride);
router.delete('/:id', authenticate, requireGuardian, deleteBride);

router.post('/:id/expose', authenticate, requireGuardian, exposeBride);
router.delete('/:id/expose/:groomId', authenticate, requireGuardian, removeExposure);
router.get('/:id/exposures', authenticate, requireGuardian, getBrideExposures);

export default router;
