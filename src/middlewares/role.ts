import { Response, NextFunction } from 'express';
import { appLogger } from '../utils/logger';
import {  MESSAGES,  Role } from '../utils/constants';
import { AuthRequest } from '../types';


export const roleMiddleware = (requiredRole: Role) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    
    if (!req.user) {
      appLogger.warn('No user data in request', { path: req.path });
      const error = new Error(MESSAGES.UNAUTHORIZED);
      error.name = 'UnauthorizedError';
      return next(error);
    }

   
    const { userId, role } = req.user;
    if (role !== requiredRole) {
      appLogger.warn('Access denied due to insufficient role', {
        userId,
        role,
        requiredRole,
        path: req.path,
      });
      const error = new Error(MESSAGES.FORBIDDEN);
      error.name = 'ForbiddenError';
      return next(error);
    }

   
    appLogger.info('Role authorized', { userId, role, path: req.path });
    next();
  };
};