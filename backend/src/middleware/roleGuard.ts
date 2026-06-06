import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

const HAS_ROLE = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRoles = req.roles || ['SOCIAL'];
    const hasRole = roles.some(r => userRoles.includes(r));
    if (!hasRole) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        messageAr: 'ليس لديك صلاحية للوصول إلى هذه الميزة',
        messageEn: 'You do not have permission to access this feature',
      });
    }
    next();
  };
};

export const requireRole = HAS_ROLE;
export const requireGuardian = HAS_ROLE('GUARDIAN', 'ADMIN');
export const requireGroom = HAS_ROLE('GROOM', 'ADMIN');
export const requireAdmin = HAS_ROLE('ADMIN');
