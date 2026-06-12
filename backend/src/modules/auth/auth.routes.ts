import { Router } from 'express';
import { register, login, verifyOtp, refreshToken, logout, getMe, updateRoles, updateAvatar, deleteAvatar, getOnboardingStatus, updateOnboarding } from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/refresh-token', refreshToken);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/roles', authenticate, updateRoles);
router.post('/avatar', authenticate, updateAvatar);
router.delete('/avatar', authenticate, deleteAvatar);
router.get('/onboarding-status', authenticate, getOnboardingStatus);
router.put('/onboarding', authenticate, updateOnboarding);

export default router;
