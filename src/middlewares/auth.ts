import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import {config} from '../config/environment';
import {appLogger} from '../utils/logger';
import { STATUS_CODES, MESSAGES } from '../utils/constants';
import { AuthRequest } from '../types';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        appLogger.warn('No token provided');
        return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.UNAUTHORIZED });
    }

    try{
        const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; role: string };
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
     };

    appLogger.info('User authenticated', { userId: decoded.userId, role: decoded.role });
    next();
  } catch (error) {
    appLogger.error('Invalid token', { error: (error as Error).message });
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.UNAUTHORIZED });
  }
}


