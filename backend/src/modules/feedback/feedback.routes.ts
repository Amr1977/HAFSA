import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { createFeedback, getTestimonials } from './feedback.controller';

const router = Router();

router.post('/', authenticate, createFeedback);
router.get('/testimonials', getTestimonials);

export default router;
