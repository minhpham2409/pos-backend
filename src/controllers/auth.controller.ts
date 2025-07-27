import { Request, Response, NextFunction } from 'express';
import { login as loginService, register as registerService, logout as logoutService , getAllUsers as getAllUsersService} from '../services/auth.service';
import { appLogger } from '../utils/logger';
import { STATUS_CODES, MESSAGES } from '../utils/constants';
import { AuthRequest, AuthRequestDto } from '../types';

export const getProfile = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    appLogger.warn('User not authenticated');
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.UNAUTHORIZED });
  }
  appLogger.info('User profile retrieved', { userId: req.user.userId });
  res.status(STATUS_CODES.OK).json({
    success: true,
    data: { user: req.user },
    
  });
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await getAllUsersService();
    appLogger.info('All users retrieved successfully', { count: users.length });
    res.status(STATUS_CODES.OK).json({
      success: true,
      data: { users }
    });
  } catch (error) {
    appLogger.error('Failed to retrieve users', { error: (error as Error).message });
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authData: AuthRequestDto = req.body;
    const result = await loginService(authData);

    
    res.cookie('jwt', result.token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict', 
      maxAge: 60 * 60 * 1000, 
    });

    appLogger.info('Login request processed successfully', { userId: result.user.id });
    res.status(STATUS_CODES.OK).json({
      success: true,
      data: { user: result.user }, 
      message: MESSAGES.LOGIN_SUCCESS,
    });
  } catch (error) {
    appLogger.error('Login request failed', {
      error: (error as Error).message,
      email: req.body.email,
    });
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authData: AuthRequestDto & { username: string; role?: 'admin' | 'user' } = req.body;
    const result = await registerService(authData);

    // Lưu token vào cookie
    res.cookie('jwt', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
    });

    appLogger.info('Register request processed successfully', { userId: result.user.id });
    res.status(STATUS_CODES.CREATED).json({
      success: true,
      data: { user: result.user }, // Không trả token trong body
      message: MESSAGES.REGISTER_SUCCESS,
    });
  } catch (error) {
    appLogger.error('Register request failed', {
      error: (error as Error).message,
      email: req.body.email,
      username: req.body.username,
    });
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];
    if (!token) {
      appLogger.warn('No token provided for logout', { userId: req.user?.userId });
      const error = new Error(MESSAGES.UNAUTHORIZED);
      error.name = 'UnauthorizedError';
      (error as any).statusCode = STATUS_CODES.UNAUTHORIZED;
      throw error;
    }

    const result = await logoutService(token, req.user!.userId);

    // Xóa cookie jwt
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    appLogger.info('Logout request processed successfully', { userId: req.user!.userId });
    res.status(STATUS_CODES.OK).json({
      success: true,
      data: result,
      message: MESSAGES.LOGOUT_SUCCESS,
    });
  } catch (error) {
    appLogger.error('Logout request failed', {
      error: (error as Error).message,
      userId: req.user?.userId,
    });
    next(error);
  }
};