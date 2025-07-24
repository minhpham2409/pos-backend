import { Response, NextFunction } from 'express';
import { appLogger } from '../utils/logger';
import {  MESSAGES,  Role } from '../utils/constants';
import { AuthRequest } from '../types';

// Middleware kiểm tra phân quyền dựa trên role
export const roleMiddleware = (requiredRole: Role) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Kiểm tra xem req.user có tồn tại (được gắn bởi authMiddleware)
    if (!req.user) {
      appLogger.warn('No user data in request', { path: req.path });
      const error = new Error(MESSAGES.UNAUTHORIZED);
      error.name = 'UnauthorizedError';
      return next(error);
    }

    // Kiểm tra vai trò của người dùng
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

    // Nếu có quyền, tiếp tục
    appLogger.info('Role authorized', { userId, role, path: req.path });
    next();
  };
};