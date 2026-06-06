import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import {
  listCategories, listServices, getMyServices, getService,
  createService, updateService, deleteService,
  createBooking, getMyBookings, updateBooking,
  addReview,
} from './services.controller';

const router = Router();

router.get('/categories', listCategories);
router.get('/', listServices);
router.get('/my', authenticate, getMyServices);
router.get('/bookings', authenticate, getMyBookings);
router.get('/:id', getService);
router.post('/', authenticate, createService);
router.put('/:id', authenticate, updateService);
router.delete('/:id', authenticate, deleteService);
router.post('/:id/book', authenticate, createBooking);
router.put('/bookings/:id', authenticate, updateBooking);
router.post('/:id/reviews', authenticate, addReview);

export default router;
